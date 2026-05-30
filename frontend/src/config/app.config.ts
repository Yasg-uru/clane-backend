export const APP_CONFIG = {
  name: "CreatorLane",
  description: "India's influencer marketing platform",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
} as const;
