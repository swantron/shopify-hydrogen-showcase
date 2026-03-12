# Vehicle Selector — Component Spec

## The Problem

ABC Paints sells vehicle-matched paint. The primary buyer journey is:
1. "I have a Honda CT70. What paint matches my bike?"
2. Find the color. Buy it.

The current store has a filter sidebar with 626 options. There is no vehicle-first entry point. Buyers who can't find their color leave.

## The Solution

A three-step cascading selector: **Make → Model → Year**. Each selection narrows the next. After Year is selected, the buyer sees only products for their vehicle.

```
[ Select Make ▾ ]  →  [ Select Model ▾ ]  →  [ Select Year ▾ ]  →  [ See Colors → ]
   Honda                  CT70                   1970
```

## Data Shape

Vehicle catalog stored as Shopify metaobjects (type: `vehicle`):

```typescript
interface Vehicle {
  make: string        // "Honda"
  model: string       // "CT70"
  year: number        // 1970
  paintCodes: string[] // ["ESI9375920", "R-157"]
  productHandles: string[] // links to matching products
}
```

The selector queries a deduplicated list of makes, then filters models by selected make, then years by selected model. No product data loaded until Year is selected.

## Component Interface

```typescript
interface VehicleSelectorProps {
  /** Called when a complete Make/Model/Year selection is made */
  onSelect: (vehicle: VehicleSelection) => void;
  /** Pre-populate from URL params if navigating back */
  initialSelection?: Partial<VehicleSelection>;
  /** Visual variant */
  variant?: 'hero' | 'compact' | 'inline';
}

interface VehicleSelection {
  make: string;
  model: string;
  year: number;
}
```

## UX Behavior

- Make dropdown is always enabled
- Model dropdown is disabled until Make is selected
- Year dropdown is disabled until Model is selected
- On Year selection: navigate to `/paint/:make/:model/:year`
- URL updates on each selection (supports browser back/forward)
- Selection persists in sessionStorage for the session
- "Start over" link clears selection

## Placement

1. **Homepage hero** — primary entry point, large format
2. **404 page** — "Find paint for your vehicle" recovery
3. **Product pages** — "Also fits these vehicles" / cross-sell
4. **Navigation** — compact version in header dropdown

## Mobile Behavior

On mobile, the three selects stack vertically. Each opens a native `<select>` (fastest on mobile, no custom dropdown overhead). Desktop uses styled custom dropdowns.
