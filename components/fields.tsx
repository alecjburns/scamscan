"use client";

export function TapSelect<T extends string>({
  label,
  hint,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        )}
        {hint && <span className="ml-1.5 font-normal text-muted">{hint}</span>}
      </legend>
      <div
        className="mt-1.5 flex flex-wrap gap-1.5"
        role="radiogroup"
        aria-label={label}
        aria-required={required || undefined}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                if (selected && required) return;
                onChange(selected ? "" : opt.value);
              }}
              className={`min-h-10 rounded-[var(--radius-pill)] border px-3 py-2 text-sm transition-colors sm:min-h-0 sm:py-1.5 ${
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface text-ink hover:border-accent"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function TextField({
  id,
  label,
  hint,
  required,
  value,
  onChange,
  placeholder,
  inputRef,
  type = "text",
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        )}
        {hint && <span className="ml-1.5 font-normal text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        ref={inputRef}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted sm:py-2 sm:text-[15px]"
      />
    </div>
  );
}
