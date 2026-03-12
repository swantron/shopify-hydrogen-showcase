import { useState, useMemo } from 'react';
import { useNavigate } from '@remix-run/react';

export interface VehicleSelection {
  make: string;
  model: string;
  year: number;
}

export interface VehicleCatalogEntry {
  make: string;
  model: string;
  year: number;
}

interface VehicleSelectorProps {
  /** Full vehicle catalog — typically loaded from Shopify metaobjects */
  catalog: VehicleCatalogEntry[];
  /** Called when Make/Model/Year is fully selected */
  onSelect?: (selection: VehicleSelection) => void;
  /** Pre-populate from URL params */
  initialSelection?: Partial<VehicleSelection>;
  /** 'hero' = large homepage format, 'compact' = header/inline */
  variant?: 'hero' | 'compact';
}

/**
 * VehicleSelector — cascading Make → Model → Year picker.
 *
 * The core UX innovation for a vehicle-matched paint store.
 * Replaces the current 626-option flat filter with a guided
 * three-step flow that matches how buyers actually think:
 * "I have a Honda CT70. What paint do I need?"
 *
 * On Year selection, navigates to /paint/:make/:model/:year.
 */
export function VehicleSelector({
  catalog,
  onSelect,
  initialSelection,
  variant = 'hero',
}: VehicleSelectorProps) {
  const navigate = useNavigate();

  const [make, setMake] = useState<string>(initialSelection?.make ?? '');
  const [model, setModel] = useState<string>(initialSelection?.model ?? '');
  const [year, setYear] = useState<number | ''>(initialSelection?.year ?? '');

  // Deduplicated makes — alphabetical
  const makes = useMemo(() => {
    return [...new Set(catalog.map((v) => v.make))].sort();
  }, [catalog]);

  // Models filtered by selected make — alphabetical
  const models = useMemo(() => {
    if (!make) return [];
    return [...new Set(
      catalog.filter((v) => v.make === make).map((v) => v.model)
    )].sort();
  }, [catalog, make]);

  // Years filtered by selected make + model — descending
  const years = useMemo(() => {
    if (!make || !model) return [];
    return [...new Set(
      catalog
        .filter((v) => v.make === make && v.model === model)
        .map((v) => v.year)
    )].sort((a, b) => b - a);
  }, [catalog, make, model]);

  function handleMakeChange(value: string) {
    setMake(value);
    setModel('');
    setYear('');
  }

  function handleModelChange(value: string) {
    setModel(value);
    setYear('');
  }

  function handleYearChange(value: string) {
    const y = parseInt(value, 10);
    setYear(y);

    const selection: VehicleSelection = { make, model, year: y };
    onSelect?.(selection);

    // Navigate to vehicle-specific paint listing
    const makePath = make.toLowerCase().replace(/\s+/g, '-');
    const modelPath = model.toLowerCase().replace(/\s+/g, '-');
    navigate(`/paint/${makePath}/${modelPath}/${y}`);
  }

  function handleReset() {
    setMake('');
    setModel('');
    setYear('');
  }

  const isHero = variant === 'hero';

  return (
    <div className={isHero ? 'w-full max-w-2xl' : 'flex items-center gap-2'}>
      {isHero && (
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4">
          Find paint for your vehicle
        </p>
      )}

      <div className={isHero
        ? 'grid grid-cols-1 sm:grid-cols-3 gap-3'
        : 'flex items-center gap-2'
      }>

        {/* Make */}
        <select
          value={make}
          onChange={(e) => handleMakeChange(e.target.value)}
          className={selectClass(isHero)}
          aria-label="Select vehicle make"
        >
          <option value="">Make</option>
          {makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Model */}
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!make}
          className={selectClass(isHero, !make)}
          aria-label="Select vehicle model"
        >
          <option value="">Model</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={!model}
          className={selectClass(isHero, !model)}
          aria-label="Select vehicle year"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Reset link — only show when a selection has been made */}
      {make && (
        <button
          onClick={handleReset}
          className="mt-3 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition-colors"
        >
          Start over
        </button>
      )}
    </div>
  );
}

function selectClass(isHero: boolean, disabled = false): string {
  const base = [
    'block w-full border border-gray-300 bg-white',
    'text-gray-900 font-medium',
    'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
    'transition-colors',
    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500',
  ];

  if (isHero) {
    return [...base, 'px-4 py-3 text-base'].join(' ');
  }
  return [...base, 'px-3 py-2 text-sm'].join(' ');
}
