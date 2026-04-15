import Image from "next/image";
import { useCallback, useRef } from "react";
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
}
export const SearchInput = ({
  value,
  onChange,
  placeholder = "Пошук",
  label = "Пошук",
  id = "search-input",
  className = "",
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearchIconClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);
  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );
  const hasValue = value.length > 0;
  return (
    <div
      className={`border-border-subtle font-montserrat text-ink-placeholder relative box-border flex shrink-0 items-center gap-2 overflow-hidden rounded-full border bg-white px-4 py-3 text-left text-base ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="placeholder:text-ink-placeholder relative h-4 min-w-0 flex-1 bg-transparent text-base leading-none text-black outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />

      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {hasValue ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Очистити пошук"
            onMouseDown={(e) => e.preventDefault()}
            className="flex cursor-pointer items-center justify-center"
          >
            <Image
              className="cursor-inherit pointer-events-none relative flex h-5 w-5 items-center justify-center overflow-hidden"
              src="/icons/close.svg"
              width={15}
              height={15}
              sizes="15px"
              alt=""
              aria-hidden="true"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSearchIconClick}
            aria-label="Пошук"
            className="relative flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden"
          >
            <Image
              className="cursor-inherit pointer-events-none absolute max-h-full w-full max-w-full overflow-hidden"
              src="/icons/search.svg"
              width={15}
              height={15}
              sizes="15px"
              alt=""
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
};
