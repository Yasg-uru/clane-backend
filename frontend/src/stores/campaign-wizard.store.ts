import { create } from "zustand";
import type { CampaignWizardData } from "@/types/campaign.types";
import { CampaignPlatform, TargetGender, CampaignDeliveryType } from "@/types/campaign.types";

export const WIZARD_TOTAL_STEPS = 5;

const INITIAL_DATA: CampaignWizardData = {
  title: "",
  platform: CampaignPlatform.INSTAGRAM,
  niche: [],
  targetLocation: "",
  targetAgeMin: 18,
  targetAgeMax: 35,
  targetGender: TargetGender.ANY,
  creatorRequirements: {},
  budgetAmount: 0,
  deadline: "",
  deliveryType: CampaignDeliveryType.REMOTE,
  shootingLat: "",
  shootingLng: "",
  shootingRadiusKm: "",
  contentBrief: "",
  revisionRounds: 1,
};

interface CampaignWizardState {
  step: number;
  data: CampaignWizardData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (patch: Partial<CampaignWizardData>) => void;
  reset: () => void;
}

export const useCampaignWizardStore = create<CampaignWizardState>()((set) => ({
  step: 1,
  data: INITIAL_DATA,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, WIZARD_TOTAL_STEPS) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  updateData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
  reset: () => set({ step: 1, data: INITIAL_DATA }),
}));
