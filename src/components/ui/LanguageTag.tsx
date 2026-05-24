interface LanguageTagProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
  /** Visual prominence. `sm` keeps the original chip; `md` is a bit larger for header use. */
  size?: "sm" | "md";
}

const SIZE_CLASSES: Record<NonNullable<LanguageTagProps["size"]>, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-4 py-2 text-sm tracking-[0.12em]",
};

export default function LanguageTag({
  label,
  onClick,
  active = false,
  size = "sm",
}: LanguageTagProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={onClick ? `Language: ${label}. Tap to cycle.` : undefined}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${SIZE_CLASSES[size]}
        transition-all duration-200 select-none
        ${
          active
            ? "bg-brown text-golden"
            : "bg-golden text-brown hover:bg-sun hover:-translate-y-0.5 hover:shadow-warm cursor-pointer"
        }
      `}
    >
      {label}
      {size === "md" && onClick && (
        <svg
          aria-hidden
          className="h-3 w-3 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      )}
    </span>
  );
}
