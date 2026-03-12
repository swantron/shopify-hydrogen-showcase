interface ProductTrustProps {
  reviewCount: number;
  rating: number; // 0-5
  /** Free shipping threshold in dollars */
  freeShippingThreshold?: number;
  /** Current cart subtotal for shipping progress */
  cartSubtotal?: number;
}

/**
 * ProductTrust — trust signals rendered near Add to Cart.
 *
 * The current VMR store has reviews but they're buried in a separate tab.
 * At the moment of purchase decision, the buyer sees nothing that builds
 * confidence. This component surfaces the three signals that matter most:
 * 1. Social proof (ratings + review count)
 * 2. Satisfaction guarantee
 * 3. Free shipping progress
 *
 * Placement: directly below the Add to Cart button.
 */
export function ProductTrust({
  reviewCount,
  rating,
  freeShippingThreshold = 75,
  cartSubtotal = 0,
}: ProductTrustProps) {
  const remaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const qualifiesForFreeShipping = remaining === 0;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">

      {/* Rating + review count */}
      <div className="flex items-center gap-2">
        <StarRating rating={rating} />
        <span className="text-sm text-gray-700 font-medium">
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">
          · {reviewCount} verified review{reviewCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Guarantee */}
      <div className="flex items-start gap-2">
        <svg
          className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <p className="text-sm text-gray-600">
          <strong className="font-medium text-gray-900">Spot-On Match Guarantee</strong>
          {' '}— sprayout test before your full order, or we make it right.
        </p>
      </div>

      {/* Free shipping progress */}
      <div>
        <p className="text-sm text-gray-600 mb-1.5">
          {qualifiesForFreeShipping ? (
            <span className="font-medium text-gray-900">✓ Free shipping on your order</span>
          ) : (
            <>
              Add <strong className="font-medium text-gray-900">${remaining.toFixed(2)}</strong>
              {' '}more for free shipping
            </>
          )}
        </p>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
}

// ── Internal component ───────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const partial = !filled && rating > star - 1;
        const pct = partial ? Math.round((rating - (star - 1)) * 100) : 0;

        return (
          <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 20 20">
            <defs>
              {partial && (
                <linearGradient id={`partial-${star}`}>
                  <stop offset={`${pct}%`} stopColor="#111827" />
                  <stop offset={`${pct}%`} stopColor="#D1D5DB" />
                </linearGradient>
              )}
            </defs>
            <polygon
              points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
              fill={
                filled ? '#111827'
                : partial ? `url(#partial-${star})`
                : '#D1D5DB'
              }
            />
          </svg>
        );
      })}
    </div>
  );
}
