import type { LucideIcon } from "lucide-react";
import { Megaphone, Gavel, Users } from "lucide-react";

export const BRAND_TYPES: string[] = [
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Food & Beverage",
  "Tech & Electronics",
  "Health & Wellness",
  "Travel & Hospitality",
  "Home & Lifestyle",
  "Finance & Fintech",
  "EdTech",
  "Other",
];

export const HOW_IT_WORKS: {
  step: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
}[] = [
  {
    step: "01",
    title: "Create a Campaign",
    desc: "Set your budget, niche, and deliverables. Go live in minutes.",
    Icon: Megaphone,
  },
  {
    step: "02",
    title: "Receive Bids",
    desc: "Verified creators pitch their ideas and rates directly to you.",
    Icon: Gavel,
  },
  {
    step: "03",
    title: "Pick a Creator",
    desc: "Review profiles, authenticity scores, and past work. Choose the best fit.",
    Icon: Users,
  },
];
