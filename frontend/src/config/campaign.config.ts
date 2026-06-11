import type { ElementType } from "react";
import { Globe } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { CampaignPlatform, CampaignDeliveryType, TargetGender } from "@/types/campaign.types";

export const PLATFORM_LABEL: Record<CampaignPlatform, string> = {
  [CampaignPlatform.INSTAGRAM]: "Instagram",
  [CampaignPlatform.YOUTUBE]: "YouTube",
  [CampaignPlatform.BOTH]: "Instagram + YouTube",
};

export const GENDER_LABEL: Record<TargetGender, string> = {
  [TargetGender.ANY]: "Any",
  [TargetGender.MALE]: "Male",
  [TargetGender.FEMALE]: "Female",
};

export const DELIVERY_TYPE_LABEL: Record<CampaignDeliveryType, string> = {
  [CampaignDeliveryType.ONSITE]: "On-site",
  [CampaignDeliveryType.REMOTE]: "Remote",
};

export const NICHE_OPTIONS: string[] = [
  "Fashion", "Beauty", "Skincare", "Fitness", "Health",
  "Food", "Travel", "Tech", "Gaming", "Music",
  "Comedy", "Lifestyle", "Parenting", "Education", "Finance",
  "Automotive", "Sports", "Photography", "Art", "Entertainment",
  "Business", "Wellness", "Home Decor", "Dance",
];

export const STEP_META = [
  { title: "Campaign Basics", desc: "Name your campaign, pick the platform and niche." },
  { title: "Target Audience", desc: "Define who the creator's audience should be." },
  { title: "Budget & Timeline", desc: "Set your budget, bid deadline, and delivery type." },
  { title: "Content Brief", desc: "Tell creators exactly what you need them to produce." },
  { title: "Review & Launch", desc: "Double-check everything before saving or publishing." },
] as const;

export const PLATFORM_OPTIONS: {
  value: CampaignPlatform;
  label: string;
  Icon: ElementType;
  iconClass: string;
  desc: string;
}[] = [
  {
    value: CampaignPlatform.INSTAGRAM,
    label: "Instagram",
    Icon: FaInstagram,
    iconClass: "size-5",
    desc: "Reels, posts, stories",
  },
  {
    value: CampaignPlatform.YOUTUBE,
    label: "YouTube",
    Icon: FaYoutube,
    iconClass: "size-5",
    desc: "Videos & shorts",
  },
  {
    value: CampaignPlatform.BOTH,
    label: "Both",
    Icon: Globe,
    iconClass: "size-5",
    desc: "Instagram + YouTube",
  },
];

export const DELIVERY_OPTIONS = [
  {
    value: CampaignDeliveryType.REMOTE,
    label: "Remote",
    desc: "Creator works from their location",
  },
  {
    value: CampaignDeliveryType.ONSITE,
    label: "Onsite",
    desc: "Creator must visit a specific location",
  },
] as const;

export const GENDER_OPTIONS = [
  { value: TargetGender.ANY, label: "Any" },
  { value: TargetGender.FEMALE, label: "Female" },
  { value: TargetGender.MALE, label: "Male" },
] as const;

export const REVISION_OPTIONS = [
  { value: 1 as const, label: "1 round", desc: "One revision included" },
  { value: 2 as const, label: "2 rounds", desc: "Two revisions included" },
] as const;

export const BRIEF_PROMPTS: string[] = [
  "What is the campaign about?",
  "What tone / mood should the content have?",
  "What are the key messages to highlight?",
  "Any specific hashtags or mentions required?",
  "What's the call-to-action?",
];
