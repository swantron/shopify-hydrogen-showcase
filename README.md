# Shopify Hydrogen Showcase

A research and portfolio project demonstrating modern Shopify Hydrogen best practices for a vehicle-specific automotive paint e-commerce store. Built as the eventual production storefront for VMR Paints.

## Why This Exists

The current VMR Paints store runs on a default Shopify Liquid theme with a 1.06% conversion rate against 52,000+ annual sessions. Industry average for e-commerce is 2-3%. This project demonstrates exactly how to close that gap.

**Projected impact at 2.0% CVR:** ~$50,000 additional annual gross profit on the same traffic.

## Key Architectural Decisions

### Hydrogen over Liquid

| | Liquid Theme | Hydrogen |
|---|---|---|
| Rendering | Server-side, full page | Streaming SSR + client hydration |
| Performance | Dependent on app bloat | Core Web Vitals optimized by default |
| Flexibility | Theme + app ecosystem | Full React component control |
| CVR impact | Baseline | +0.3-0.5% from speed alone |

Shopify's data shows a 1-second improvement in load time increases conversions by ~7%. A Hydrogen rebuild typically cuts Time to First Byte by 40-60% vs a Liquid theme loaded with apps.

### URL Structure

Current (broken for SEO):
```
/products/honda-ct70-1970-esi9375920
```

Target (semantic + rankable):
```
/paint/honda/ct70/1970/candy-ruby-red
```

Each URL segment is a rankable keyword. "Honda CT70 1970 paint" has real search volume. The current URL structure throws this away entirely.

### Vehicle Selector

The defining UX feature for a vehicle-matched paint store. A cascading Make → Model → Year selector that filters the product catalog before the customer ever sees a product. Eliminates the 626-option filter problem entirely.

See [`docs/vehicle-selector.md`](docs/vehicle-selector.md) for full spec.

### Complete Kit Pattern

Current store has 4 add-on dropdowns before Add to Cart (Basecoat, Clearcoat, Primer, Accessory Kit). Classic decision paralysis. The Complete Kit component pre-selects the recommended combination and presents customization as a secondary path.

See [`app/components/CompleteKit.tsx`](app/components/CompleteKit.tsx).

## Stack

- [Shopify Hydrogen](https://hydrogen.shopify.dev/) — React-based Shopify storefront framework
- [Remix](https://remix.run/) — Hydrogen's routing and data loading layer
- TypeScript — full type safety across components and Storefront API responses
- Tailwind CSS — utility-first styling
- Vite — dev server and build tooling

## Getting Started

```bash
npm create @shopify/hydrogen@latest
# Select: Hydrogen Demo Store as starting point
# Then replace app/components with components from this repo

npm install
npm run dev
```

## Project Structure

```
app/
  components/
    VehicleSelector.tsx   # Year/Make/Model cascading selector
    CompleteKit.tsx       # Replaces 4-dropdown add-on pattern
    ProductTrust.tsx      # Trust signals near Add to Cart
docs/
  architecture.md         # Detailed architectural decisions
  vehicle-selector.md     # Vehicle selector component spec
  conversion-optimization.md  # CVR analysis and fix roadmap
```

## Live Case Study

VMR Paints — [vmrpaints.com](https://vmrpaints.com)
- Specialty automotive paint, Shopify store
- 52,438 sessions/yr | 655 orders | $230.98 AOV
- Current CVR: 1.06% | Target: 2.0%+
- Rebuild in progress — results to be documented here
