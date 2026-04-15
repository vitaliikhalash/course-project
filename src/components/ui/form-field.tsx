import { InputHTMLAttributes } from "react";
import { TextInput } from "./text-input";
interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hasError?: boolean;
}
export const FormField = ({
  id,
  label,
  hasError = false,
  ...inputProps
}: FormFieldProps) => (
  <div className="flex flex-col items-start gap-2 self-stretch">
    <label htmlFor={id} className="text-ink-strong text-base">
      {label}
    </label>
    <TextInput id={id} hasError={hasError} {...inputProps} />
  </div>
);
