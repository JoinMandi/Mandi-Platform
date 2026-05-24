const PETAL_COLORS = ["#F2C14E", "#F07B54", "#E66C84", "#F5A623", "#C94A2B"];

/**
 * A small one-shot petal burst — echoes the completion bloom. Decorative only;
 * absolutely positioned, fills its nearest positioned ancestor. Place inside a
 * `relative` element and mount it to fire the burst.
 */
export default function PetalBurst({ count = 10 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: `calc(50% + ${Math.cos(angle) * 10}px)`,
              top: `calc(50% + ${Math.sin(angle) * 10}px)`,
              animation: `bloom 1.6s ease-out ${i * 55}ms forwards`,
            }}
          >
            <span
              className="block h-2.5 w-2.5"
              style={{
                background: PETAL_COLORS[i % PETAL_COLORS.length],
                borderRadius: "50% 50% 50% 0",
                transform: `rotate(${angle + Math.PI / 4}rad)`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
