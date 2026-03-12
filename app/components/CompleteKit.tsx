import { useState } from 'react';
import { useFetcher } from '@remix-run/react';

export interface KitItem {
  variantId: string;
  title: string;
  price: number; // in cents
  required: boolean;
}

export interface CompleteKitProps {
  /** The base paint color — always required, pre-selected */
  baseColor: KitItem;
  /** Recommended clearcoat — pre-selected, can be deselected */
  clearcoat: KitItem;
  /** Optional primer — off by default, togglable */
  primer: KitItem;
  /** Optional accessory kit — off by default, togglable */
  accessoryKit: KitItem;
  /** Shopify cart line add endpoint */
  cartLinesAddUrl?: string;
}

/**
 * CompleteKit — replaces the current 4-dropdown add-on pattern.
 *
 * The current VMR store has four required dropdowns before Add to Cart:
 * Basecoat, Clearcoat, Primer, Accessory Kit. Each has multiple options.
 * This is decision paralysis — buyers drop off without purchasing.
 *
 * This component pre-selects the recommended bundle (base + clearcoat)
 * and presents primer/accessories as optional toggles. The buyer's default
 * action is one click. Customization is available but not required.
 *
 * UX principle: make the right thing the easy thing.
 */
export function CompleteKit({
  baseColor,
  clearcoat,
  primer,
  accessoryKit,
}: CompleteKitProps) {
  const fetcher = useFetcher();

  // Clearcoat is recommended — pre-selected
  const [includeClearcoat, setIncludeClearcoat] = useState(true);
  const [includePrimer, setIncludePrimer] = useState(false);
  const [includeAccessories, setIncludeAccessories] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  const selectedItems = [
    baseColor,
    ...(includeClearcoat ? [clearcoat] : []),
    ...(includePrimer ? [primer] : []),
    ...(includeAccessories ? [accessoryKit] : []),
  ];

  const totalCents = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = (totalCents / 100).toFixed(2);

  const isAdding = fetcher.state !== 'idle';

  function handleAddKit() {
    const variantIds = selectedItems.map((item) => item.variantId);
    fetcher.submit(
      { variantIds: JSON.stringify(variantIds) },
      { method: 'post', action: '/cart/add' }
    );
  }

  return (
    <div className="border border-gray-200 p-5">

      {/* Kit summary — what's included */}
      <div className="mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">
          Complete Kit
        </p>

        <div className="space-y-2">
          {/* Base color — always included */}
          <KitLineItem item={baseColor} included={true} locked />

          {/* Clearcoat — recommended, toggleable in customize mode */}
          <KitLineItem
            item={clearcoat}
            included={includeClearcoat}
            recommended
            locked={!showCustomize}
            onToggle={showCustomize ? () => setIncludeClearcoat((v) => !v) : undefined}
          />

          {/* Primer — optional */}
          {(showCustomize || includePrimer) && (
            <KitLineItem
              item={primer}
              included={includePrimer}
              locked={!showCustomize}
              onToggle={showCustomize ? () => setIncludePrimer((v) => !v) : undefined}
            />
          )}

          {/* Accessories — optional */}
          {(showCustomize || includeAccessories) && (
            <KitLineItem
              item={accessoryKit}
              included={includeAccessories}
              locked={!showCustomize}
              onToggle={showCustomize ? () => setIncludeAccessories((v) => !v) : undefined}
            />
          )}
        </div>
      </div>

      {/* Customize toggle */}
      <button
        onClick={() => setShowCustomize((v) => !v)}
        className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition-colors mb-4 block"
      >
        {showCustomize ? 'Done customizing' : 'Customize kit'}
      </button>

      {/* Total + Add to Cart */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-2xl font-light tracking-tight">${totalPrice}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleAddKit}
          disabled={isAdding}
          className={[
            'px-6 py-3 text-sm font-medium tracking-wide uppercase',
            'bg-gray-900 text-white',
            'hover:bg-gray-700 transition-colors',
            isAdding ? 'opacity-50 cursor-wait' : '',
          ].join(' ')}
        >
          {isAdding ? 'Adding…' : 'Add Kit to Cart'}
        </button>
      </div>

      {/* First-time buyer note */}
      <p className="text-xs text-gray-400 mt-3">
        Not sure what you need?{' '}
        <a href="/pages/what-do-i-need" className="underline underline-offset-2 hover:text-gray-600">
          See our paint guide →
        </a>
      </p>
    </div>
  );
}

// ── Internal component ───────────────────────────────────────

interface KitLineItemProps {
  item: KitItem;
  included: boolean;
  recommended?: boolean;
  locked?: boolean;
  onToggle?: () => void;
}

function KitLineItem({ item, included, recommended, locked, onToggle }: KitLineItemProps) {
  const price = (item.price / 100).toFixed(2);

  return (
    <div className={[
      'flex items-center justify-between py-1.5',
      !included ? 'opacity-40' : '',
    ].join(' ')}>

      <div className="flex items-center gap-2">
        {/* Checkbox — locked items show a solid indicator */}
        {locked ? (
          <div className={[
            'w-4 h-4 flex items-center justify-center border',
            included ? 'bg-gray-900 border-gray-900' : 'border-gray-300',
          ].join(' ')}>
            {included && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        ) : (
          <input
            type="checkbox"
            checked={included}
            onChange={onToggle}
            className="w-4 h-4 accent-gray-900 cursor-pointer"
            disabled={item.required}
          />
        )}

        <div>
          <span className="text-sm font-medium">{item.title}</span>
          {recommended && (
            <span className="ml-2 text-xs text-gray-400 italic">recommended</span>
          )}
        </div>
      </div>

      <span className="text-sm text-gray-600">${price}</span>
    </div>
  );
}
