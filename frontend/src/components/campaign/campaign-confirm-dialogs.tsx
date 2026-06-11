"use client";

import type { ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CampaignConfirmDialogsProps = {
  closeConfirm: boolean;
  onCloseConfirmChange: (open: boolean) => void;
  onClose: () => void;
  isClosing: boolean;
  acceptConfirmOpen: boolean;
  onAcceptConfirmClose: () => void;
  onAccept: () => void;
  declineConfirmOpen: boolean;
  onDeclineConfirmClose: () => void;
  onDecline: () => void;
};

export function CampaignConfirmDialogs({
  closeConfirm,
  onCloseConfirmChange,
  onClose,
  isClosing,
  acceptConfirmOpen,
  onAcceptConfirmClose,
  onAccept,
  declineConfirmOpen,
  onDeclineConfirmClose,
  onDecline,
}: CampaignConfirmDialogsProps): ReactElement {
  return (
    <>
      <AlertDialog open={closeConfirm} onOpenChange={onCloseConfirmChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently close the campaign. It will no longer accept new bids
              and cannot be re-opened. Any pending bids will be auto-declined.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClose}
              disabled={isClosing}
              className="border-transparent bg-destructive text-white hover:bg-destructive/90"
            >
              Close Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={acceptConfirmOpen}
        onOpenChange={(open) => !open && onAcceptConfirmClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this bid?</AlertDialogTitle>
            <AlertDialogDescription>
              Accepting creates an escrow and locks the collab. All other pending bids
              will be auto-declined. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onAccept}
              className="border-transparent bg-gradient-ig text-white hover:opacity-90"
            >
              Accept &amp; Create Escrow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={declineConfirmOpen}
        onOpenChange={(open) => !open && onDeclineConfirmClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this bid?</AlertDialogTitle>
            <AlertDialogDescription>
              The creator will be notified that their bid was not selected. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDecline}
              className="border-transparent bg-destructive text-white hover:bg-destructive/90"
            >
              Decline Bid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
