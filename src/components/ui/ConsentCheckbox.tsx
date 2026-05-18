"use client";

interface ConsentCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

export default function ConsentCheckbox({
  label,
  checked,
  onChange,
  required = false,
}: ConsentCheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="sr-only"
        />
        <div
          className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center
            transition-all duration-150
            ${
              checked
                ? "bg-terra border-terra"
                : "bg-white border-coral/50 group-hover:border-terra"
            }
          `}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-cream"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-brown text-sm leading-relaxed">{label}</span>
    </label>
  );
}
