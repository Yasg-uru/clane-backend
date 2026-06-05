export const CAMPAIGN_ENDPOINTS = {
  list: "/campaigns",
  create: "/campaigns",
  detail: (id: string): string => `/campaigns/${id}`,
  update: (id: string): string => `/campaigns/${id}`,
  publish: (id: string): string => `/campaigns/${id}/publish`,
  unpublish: (id: string): string => `/campaigns/${id}/unpublish`,
  close: (id: string): string => `/campaigns/${id}/close`,
  browse: "/campaigns/browse",
  browseDetail: (slug: string): string => `/campaigns/browse/${slug}`,
} as const;

export const BID_ENDPOINTS = {
  submit: "/bids",
  myBids: "/bids/my",
  myBidForCampaign: (campaignId: string): string => `/bids/my/campaign/${campaignId}`,
  forCampaign: (campaignId: string): string => `/bids/campaign/${campaignId}`,
  withdraw: (bidId: string): string => `/bids/${bidId}/withdraw`,
  shortlist: (bidId: string): string => `/bids/${bidId}/shortlist`,
  unshortlist: (bidId: string): string => `/bids/${bidId}/shortlist`,
  decline: (bidId: string): string => `/bids/${bidId}/decline`,
  accept: (bidId: string): string => `/bids/${bidId}/accept`,
} as const;

export const ESCROW_ENDPOINTS = {
  list: "/escrow",
  detail: (escrowId: string): string => `/escrow/${escrowId}`,
  cancel: (escrowId: string): string => `/escrow/${escrowId}/cancel`,
  refreshLink: (escrowId: string): string => `/escrow/${escrowId}/refresh-link`,
} as const;

export const COLLAB_ENDPOINTS = {
  list: "/collab",
  detail: (collabRoomId: string): string => `/collab/${collabRoomId}`,
} as const;

export const CREATOR_ENDPOINTS = {
  browse: "/creators",
} as const;

export const SETTINGS_ENDPOINTS = {
  updateProfile: "/me/profile",
  changePassword: "/me/password",
  notificationPreferences: "/me/notification-preferences",
  disconnectSocial: (provider: string): string => `/me/connections/${provider}`,
  deleteAccount: "/me",
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
