// Temporary placeholder data — replace with real API calls when endpoints are ready

export interface MockCampaignPreview {
  id: string;
  brand: string;
  title: string;
  niche: string[];
  budget: string;
  deadline: string;
  platform: "Instagram" | "YouTube";
  bids: number;
}

export const MOCK_CAMPAIGNS: MockCampaignPreview[] = [
  { id: "c1", brand: "Nykaa Beauty", title: "Summer Glow — Skincare Collection Launch", niche: ["Beauty", "Skincare"], budget: "₹25K – ₹50K", deadline: "12 days left", platform: "Instagram", bids: 14 },
  { id: "c2", brand: "boAt Lifestyle", title: "Noise-Cancelling Headphones Review & Unboxing", niche: ["Tech", "Reviews"], budget: "₹15K – ₹30K", deadline: "7 days left", platform: "YouTube", bids: 9 },
  { id: "c3", brand: "Swiggy Instamart", title: "10-Minute Grocery Delivery — Creator Series", niche: ["Food", "Lifestyle"], budget: "₹20K – ₹40K", deadline: "18 days left", platform: "Instagram", bids: 22 },
];
