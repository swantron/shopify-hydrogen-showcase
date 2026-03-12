# Architecture Decisions

## Rendering Strategy

Hydrogen uses Remix's streaming SSR. Product pages render server-side for SEO and initial paint, then hydrate selectively. The vehicle selector and Add to Cart interactions are client components; product content and metadata are server-rendered.

```
Route (server) → streams HTML → client hydrates interactive islands
```

This means Google sees full product content immediately (no client-side rendering SEO penalty) while the user gets fast interactivity for the vehicle selector.

## Data Layer

All product data flows through Shopify's Storefront API (GraphQL). Vehicle compatibility is stored as product metafields:

```graphql
metafields(identifiers: [
  { namespace: "vehicle", key: "make" },
  { namespace: "vehicle", key: "model" },
  { namespace: "vehicle", key: "year" },
  { namespace: "vehicle", key: "paint_code" }
]) {
  key
  value
}
```

The vehicle selector queries a custom metaobject type `vehicle_catalog` that holds the full Make/Model/Year taxonomy independently of products. This lets us build the selector UI without loading the entire product catalog.

## URL Structure

```
/paint/:make/:model/:year/:color-slug

Examples:
  /paint/honda/ct70/1970/candy-ruby-red
  /paint/honda/civic/2018/aegean-blue-pearl-b-537p
  /paint/harley-davidson/softail/2022/vivid-black
```

Each segment maps to a Shopify collection handle or product tag. The color slug is derived from the product title, normalized to kebab-case. This structure:

- Creates rankable URLs for long-tail searches ("Honda CT70 1970 candy ruby red paint")
- Enables breadcrumb navigation automatically
- Makes sharing and bookmarking intuitive for buyers
- Requires a URL migration from current `/products/` structure (handle with 301 redirects)

## Component Architecture

```
Routes
├── paint.$make.$model.$year.$color   # Product detail
├── paint.$make.$model.$year          # Year results
├── paint.$make.$model                # Model results
├── paint.$make                       # Make results
└── paint                             # Vehicle selector entry

Components (server)
├── ProductDetail                     # Full product page
├── ProductGrid                       # Collection listings
└── Breadcrumb                        # Auto-generated from URL

Components (client — interactive)
├── VehicleSelector                   # Make/Model/Year cascading
├── CompleteKit                       # Add-to-cart bundler
├── ProductTrust                      # Trust signals
└── CartDrawer                        # Slide-out cart
```

## Performance Targets

| Metric | Current (Liquid) | Target (Hydrogen) |
|---|---|---|
| LCP | ~3.5s (estimated) | < 1.8s |
| FID / INP | Unknown | < 100ms |
| CLS | Unknown | < 0.1 |
| Lighthouse Score | ~55-65 | 90+ |

Performance is not vanity — Shopify's internal data shows a 100ms improvement in load time increases conversions by 1%. A 1.5s improvement on a store with 52K sessions/yr and $231 AOV is meaningful.

## Kit Bundling Logic

Complete Kit pricing logic lives server-side to avoid price manipulation:

```typescript
// Server route — calculates kit price from variant IDs
export async function loader({ request, context }: LoaderArgs) {
  const kitVariants = await context.storefront.query(KIT_QUERY, {
    variables: { productId, clearcoatVariantId, primerVariantId }
  });
  // Return calculated kit price — never trust client-calculated prices
  return json({ kitPrice: calculateKitPrice(kitVariants) });
}
```

## SEO

- Server-rendered metadata per route (title, description, og:tags)
- Structured data (JSON-LD) for Product schema on every PDP
- Sitemap auto-generated from Shopify product/collection handles
- Canonical URLs handle color variant deduplication
- 301 redirects from legacy `/products/` URLs
