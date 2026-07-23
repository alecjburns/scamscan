"use client";

export function TapSelect<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">
        {label}
        {hint && <span className="ml-1.5 font-normal text-muted">{hint}</span>}
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(selected ? "" : opt.value)}
              className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition-colors ${
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
  value,
  onChange,
  placeholder,
  inputRef,
  type = "text",
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {hint && <span className="ml-1.5 font-normal text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-muted"
      />
    </div>
  );
}
