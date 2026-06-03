export const CAMPAIGN_ENDPOINTS = {
  list: "/campaigns",
  create: "/campaigns",
  detail: (id: string): string => `/campaigns/${id}`,
  update: (id: string): string => `/campaigns/${id}`,
  publish: (id: string): string => `/campaigns/${id}/publish`,
  unpublish: (id: string): string => `/campaigns/${id}/unpublish`,
  close: (id: string): string => `/campaigns/${id}/close`,
} as const;

export const AUTH_ENDPOINTS = {
  registerBrand: "/auth/brand/register",
  registerCreator: "/auth/creator/register",
  verifyOtp: "/auth/verify-otp",
  resendOtp: "/auth/resend-otp",
  login: "/auth/login",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
  initiateSocialAuth: (role: string, provider: string) => `/auth/${role}/${provider}`,
  handleSocialCallback: (role: string, provider: string) => `/auth/${role}/${provider}/callback`,
  connectSocialAccount: (role: string, provider: string) => `/auth/${role}/${provider}/connect`,
  completeSocialProfile: (role: string) => `/auth/${role}/complete-profile`,
  submitInstagramEmail: (role: string) => `/auth/${role}/instagram/submit-email`,
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;
