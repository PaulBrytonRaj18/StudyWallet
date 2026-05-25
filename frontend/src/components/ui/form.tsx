import type { ReactNode } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  FieldValues,
  Path,
} from "react-hook-form";

export interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  required?: boolean;
  hint?: string;
  children: (fieldProps: {
    id: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  required,
  hint,
  children,
}: FormFieldProps<T>) {
  const error = errors[name];
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children({
        id: name,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : hint ? hintId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error.message as string}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
