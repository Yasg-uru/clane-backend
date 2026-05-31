/**
 * Instagram access tokens are long-lived (60 days). Warn the user when the
 * token will expire within this window so they can re-authenticate.
 */
export const INSTAGRAM_TOKEN_EXPIRY_WARNING_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
