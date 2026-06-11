import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // In Next.js 15/16, staleTimes.dynamic defaults to 0, meaning the Router
    // Cache evicts page segments immediately after navigation. This forces a
    // full RSC re-fetch and component remount on every back-navigation, making
    // pages appear to reload from scratch even though TanStack Query has cache.
    //
    // Setting dynamic: 30 keeps the rendered page in the Router Cache for 30s.
    // Back-navigations within that window restore the exact component tree
    // (including React state) — no remount, no loading flash, instant render.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
