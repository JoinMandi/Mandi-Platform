interface LanguageTagProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export default function LanguageTag({
  label,
  onClick,
  active = false,
}: LanguageTagProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={`
        inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold
        transition-colors duration-150 select-none
        ${
          active
            ? "bg-brown text-golden"
            : "bg-golden text-brown hover:bg-sun cursor-pointer"
        }
      `}
    >
      {label}
    </span>
  );
}
