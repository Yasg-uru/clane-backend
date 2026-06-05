"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsSectionCard } from "./settings-section-card";
import { SettingsRow } from "./settings-row";
import { useDeleteAccount } from "@/hooks/settings/useSettings";

const CONFIRM_WORD = "DELETE";

export function DangerZoneSettings(): ReactElement {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const canDelete = confirmation === CONFIRM_WORD && !isPending;

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (!next) setConfirmation("");
  }

  return (
    <SettingsSectionCard
      title="Danger zone"
      description="These actions are permanent and cannot be undone."
      destructive
    >
      <SettingsRow
        label="Delete account"
        description="Permanently remove your profile, campaigns, bids and collab history. This cannot be reversed."
        control={
          <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Delete account
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently erase all of your data. Active collabs and pending
                  payouts must be settled first. To continue, type{" "}
                  <span className="font-semibold text-foreground">{CONFIRM_WORD}</span> below.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="sr-only">
                  Type {CONFIRM_WORD} to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmation}
                  autoComplete="off"
                  placeholder={CONFIRM_WORD}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!canDelete}
                  onClick={() => deleteAccount()}
                >
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Delete permanently
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />
    </SettingsSectionCard>
  );
}
