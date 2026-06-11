"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import { EscrowService } from "@/domain/payment/EscrowService";
import { EscrowRepository } from "@/domain/payment/EscrowRepository";
import { useIsReady } from "@/hooks/common/useIsReady";

const escrowService = new EscrowService(new EscrowRepository());

export function useEscrows() {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.escrow.list(),
    queryFn: () => escrowService.listEscrows(),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useEscrowDetail(escrowId: string) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.escrow.detail(escrowId),
    queryFn: () => escrowService.getEscrow(escrowId),
    enabled: ready && Boolean(escrowId),
    staleTime: 60_000,
  });
}

export function useCancelEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (escrowId: string) => escrowService.cancelEscrow(escrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.escrow.all });
      toast.success("Escrow cancelled.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRefreshPaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (escrowId: string) => escrowService.refreshPaymentLink(escrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.escrow.all });
      toast.success("Payment link refreshed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
