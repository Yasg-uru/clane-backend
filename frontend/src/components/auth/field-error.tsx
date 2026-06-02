export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error !== null && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

interface FieldErrorProps {
  errors: unknown[];
}

export function FieldError({ errors }: FieldErrorProps): React.ReactElement | null {
  if (!errors.length) return null;
  return (
    <p className="text-sm font-medium text-destructive">{extractErrorMessage(errors[0])}</p>
  );
}
