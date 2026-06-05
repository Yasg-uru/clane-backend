"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import { CampaignService } from "@/domain/campaign/CampaignService";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
import type { BrandCampaignFilters } from "@/types/campaign.types";
import type { CampaignBrowseFilters } from "@/types/creator.types";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import { ROUTES } from "@/config/routes.config";
import type { ICreateCampaignPayload } from "@/domain/campaign/ICampaignRepository";
import { useIsReady } from "@/hooks/common/useIsReady";

const campaignService = new CampaignService(new CampaignRepository());

export function useBrandCampaigns(filters: BrandCampaignFilters = {}) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.campaign.list(filters as Record<string, unknown>),
    queryFn: () => campaignService.getBrandCampaigns(filters),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useCampaignDetail(id: string) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.campaign.detail(id),
    queryFn: () => campaignService.getCampaignDetail(id),
    enabled: ready && Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const reset = useCampaignWizardStore((s) => s.reset);

  return useMutation({
    mutationFn: (payload: ICreateCampaignPayload) => campaignService.createDraft(payload),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.all });
      toast.success("Campaign draft created!");
      reset();
      router.push(ROUTES.brand.campaigns);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateAndPublishCampaign() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const reset = useCampaignWizardStore((s) => s.reset);

  return useMutation({
    mutationFn: async (payload: ICreateCampaignPayload) => {
      const draft = await campaignService.createDraft(payload);
      return campaignService.publishCampaign(draft._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.all });
      toast.success("Campaign published successfully!");
      reset();
      router.push(ROUTES.brand.campaigns);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePublishCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.publishCampaign(id),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.all });
      queryClient.setQueryData(queryKeys.campaign.detail(campaign._id), campaign);
      toast.success("Campaign published!");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUnpublishCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.unpublishCampaign(id),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.all });
      queryClient.setQueryData(queryKeys.campaign.detail(campaign._id), campaign);
      toast.success("Campaign unpublished.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCloseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.closeCampaign(id),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.all });
      queryClient.setQueryData(queryKeys.campaign.detail(campaign._id), campaign);
      toast.success("Campaign closed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBrowseCampaigns(filters: CampaignBrowseFilters = {}) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.campaign.browse(filters as Record<string, unknown>),
    queryFn: () => campaignService.browseCampaigns(filters),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useCampaignDetailForCreator(slug: string) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.campaign.browseDetail(slug),
    queryFn: () => campaignService.getCampaignDetailForCreator(slug),
    enabled: ready && Boolean(slug),
    staleTime: 60_000,
  });
}
