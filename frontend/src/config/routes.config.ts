export const ROUTES = {
  home: "/",
  auth: {
    login: "/login",
    registerBrand: "/register/brand",
    registerCreator: "/register/creator",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
  },
  brand: {
    dashboard: "/dashboard",
    campaigns: "/campaigns",
    creators: "/creators",
    collabs: "/collabs",
    payments: "/payments",
    settings: "/settings",
  },
  creator: {
    dashboard: "/dashboard",
    discover: "/discover",
    bids: "/bids",
    collabs: "/collabs",
    earnings: "/earnings",
    portfolio: "/portfolio",
    settings: "/settings",
  },
} as const;
