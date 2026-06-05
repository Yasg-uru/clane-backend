"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import { BidService } from "@/domain/bid/BidService";
import { BidRepository } from "@/domain/bid/BidRepository";
import type { SubmitBidPayload, CreatorBidFilters } from "@/types/bid.types";
import { useIsReady } from "@/hooks/common/useIsReady";

const bidService = new BidService(new BidRepository());

export function useMyBids(filters: CreatorBidFilters = {}) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.bid.myBids(filters as Record<string, unknown>),
    queryFn: () => bidService.getMyBids(filters),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useBidsForCampaign(campaignId: string) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.bid.forCampaign(campaignId),
    queryFn: () => bidService.getBidsForCampaign(campaignId),
    enabled: ready && Boolean(campaignId),
    staleTime: 60_000,
  });
}

export function useMyBidForCampaign(campaignId: string) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.bid.myBidForCampaign(campaignId),
    queryFn: () => bidService.getMyBidForCampaign(campaignId),
    enabled: ready && Boolean(campaignId),
    staleTime: 60_000,
  });
}

export function useSubmitBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitBidPayload) => bidService.submitBid(payload),
    onSuccess: (bid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bid.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.browse() });
      toast.success("Bid submitted successfully!");
      return bid;
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useWithdrawBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => bidService.withdrawBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bid.all });
      toast.success("Bid withdrawn.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useShortlistBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => bidService.shortlistBid(bidId),
    onSuccess: (bid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bid.forCampaign(bid.campaignId) });
      toast.success("Creator shortlisted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUnshortlistBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => bidService.unshortlistBid(bidId),
    onSuccess: (bid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bid.forCampaign(bid.campaignId) });
      toast.success("Creator removed from shortlist.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeclineBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => bidService.declineBid(bidId),
    onSuccess: (bid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bid.forCampaign(bid.campaignId) });
      toast.success("Bid declined.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAcceptBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => bidService.acceptBid(bidId),
    onSuccess: (bid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bid.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.escrow.all });
      toast.success("Bid accepted! Escrow has been created.");
      return bid;
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
