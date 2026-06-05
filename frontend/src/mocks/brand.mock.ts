// Temporary placeholder data — replace with real API calls when endpoints are ready

export const MOCK_CREATOR_PREVIEWS = [
  { name: "Priya Sharma", handle: "@priya.creates", niche: ["Fashion", "Lifestyle"], followers: "180K", platform: "Instagram" as const, score: 94, initials: "PS" },
  { name: "Arjun Tech", handle: "@arjun.tech", niche: ["Tech", "Reviews"], followers: "220K", platform: "YouTube" as const, score: 91, initials: "AT" },
  { name: "Sneha Verma", handle: "@sneha.eats", niche: ["Food", "Travel"], followers: "95K", platform: "Instagram" as const, score: 97, initials: "SV" },
  { name: "Rahul Fitness", handle: "@rahul.fit", niche: ["Fitness", "Health"], followers: "310K", platform: "YouTube" as const, score: 88, initials: "RF" },
] as const;

export type MockCreatorPreview = (typeof MOCK_CREATOR_PREVIEWS)[number];

export interface MockCreatorDetailed {
  id: string;
  fullName: string;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  city: string;
  matchScore: number;
  platform: "Instagram" | "YouTube" | "Both";
  engagementRate: number;
  avgViews: number;
}

export const MOCK_CREATORS: MockCreatorDetailed[] = [
  { id: "1", fullName: "Priya Sharma", instagramHandle: "@priya.creates", instagramFollowers: 180_000, niche: ["Fashion", "Lifestyle"], city: "Mumbai", matchScore: 94, platform: "Instagram", engagementRate: 4.2, avgViews: 85_000 },
  { id: "2", fullName: "Arjun Mehta", instagramHandle: "@arjun.tech", instagramFollowers: 220_000, niche: ["Tech", "Reviews"], city: "Bangalore", matchScore: 91, platform: "YouTube", engagementRate: 3.8, avgViews: 120_000 },
  { id: "3", fullName: "Sneha Verma", instagramHandle: "@sneha.eats", instagramFollowers: 95_000, niche: ["Food", "Travel"], city: "Delhi", matchScore: 97, platform: "Instagram", engagementRate: 6.1, avgViews: 45_000 },
  { id: "4", fullName: "Rahul Fitness", instagramHandle: "@rahul.fit", instagramFollowers: 310_000, niche: ["Fitness", "Health"], city: "Pune", matchScore: 88, platform: "YouTube", engagementRate: 5.3, avgViews: 200_000 },
  { id: "5", fullName: "Ananya Kapoor", instagramHandle: "@ananya.beauty", instagramFollowers: 145_000, niche: ["Beauty", "Skincare"], city: "Mumbai", matchScore: 92, platform: "Instagram", engagementRate: 5.7, avgViews: 70_000 },
  { id: "6", fullName: "Dev Kumar", instagramHandle: "@dev.travels", instagramFollowers: 78_000, niche: ["Travel", "Photography"], city: "Jaipur", matchScore: 85, platform: "Instagram", engagementRate: 4.9, avgViews: 35_000 },
  { id: "7", fullName: "Meera Pillai", instagramHandle: "@meera.dance", instagramFollowers: 260_000, niche: ["Dance", "Entertainment"], city: "Chennai", matchScore: 90, platform: "Both", engagementRate: 7.2, avgViews: 150_000 },
  { id: "8", fullName: "Vikram Singh", instagramHandle: "@vikram.finance", instagramFollowers: 420_000, niche: ["Finance", "Education"], city: "Hyderabad", matchScore: 86, platform: "YouTube", engagementRate: 3.1, avgViews: 280_000 },
];
