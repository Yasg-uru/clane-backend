export interface ErrorResponseBody {
  success: false;
  message: string;
  code?: string;
  errors?: unknown[];
}

export const buildErrorResponse = (
  message: string,
  code?: string,
  errors?: unknown[],
): ErrorResponseBody => {
  const body: ErrorResponseBody = { success: false, message };
  if (code) body.code = code;
  if (errors?.length) body.errors = errors;
  return body;
};
