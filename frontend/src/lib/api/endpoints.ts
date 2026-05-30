export const AUTH_ENDPOINTS = {
  registerBrand: "/auth/brand/register",
  registerCreator: "/auth/creator/register",
  verifyOtp: "/auth/verify-otp",
  resendOtp: "/auth/resend-otp",
  login: "/auth/login",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
} as const;
