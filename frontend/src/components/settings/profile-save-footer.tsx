import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileSaveFooterProps = {
  isDirty: boolean;
  isBusy: boolean;
  onDiscard: () => void;
};

export function ProfileSaveFooter({
  isDirty,
  isBusy,
  onDiscard,
}: ProfileSaveFooterProps): ReactElement {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!isDirty || isBusy}
        onClick={onDiscard}
      >
        Discard
      </Button>
      <Button
        type="submit"
        size="sm"
        className="bg-gradient-ig text-white hover:opacity-90"
        disabled={!isDirty || isBusy}
      >
        {isBusy && <Loader2 className="mr-2 size-4 animate-spin" />}
        Save changes
      </Button>
    </>
  );
}
