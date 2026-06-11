"use client";

import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { IndianRupee, Calendar, FileText, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { submitBidSchema } from "@/schemas/bid.schema";
import { useSubmitBid } from "@/hooks/bid/useBids";
import type { CampaignBrowseItem } from "@/types/creator.types";

type BidFormProps = {
  campaign: CampaignBrowseItem;
  onSuccess: () => void;
  onCancel: () => void;
};

export function BidForm({ campaign, onSuccess, onCancel }: BidFormProps): ReactElement {
  const { mutateAsync: submitBid, isPending } = useSubmitBid();

  const form = useForm({
    defaultValues: {
      campaignId: campaign._id,
      proposedAmount: campaign.budgetAmount,
      pitch: "",
      proposedTimeline: 14,
      attachmentUrl: "",
    },
    validators: { onSubmit: submitBidSchema },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        attachmentUrl: value.attachmentUrl || undefined,
      };
      await submitBid(payload);
      onSuccess();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      {/* Campaign preview */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bidding on</p>
        <p className="text-sm font-semibold text-foreground line-clamp-1">{campaign.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] capitalize">{campaign.platform}</Badge>
          <span className="text-xs text-muted-foreground">by {campaign.brandName}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Campaign budget: ₹{campaign.budgetAmount.toLocaleString("en-IN")}</p>
      </div>

      <Separator />

      {/* Proposed Amount */}
      <form.Field name="proposedAmount">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="flex items-center gap-1.5">
              <IndianRupee className="size-3.5 text-muted-foreground" />
              Your Bid Amount (₹)
            </Label>
            <Input
              id={field.name}
              type="number"
              min={500}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              placeholder="e.g. 15000"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Pitch */}
      <form.Field name="pitch">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="flex items-center gap-1.5">
              <FileText className="size-3.5 text-muted-foreground" />
              Your Pitch
            </Label>
            <Textarea
              id={field.name}
              rows={4}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Describe your content idea, why you're the right fit, and what you'll deliver…"
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              {field.state.meta.errors.length > 0 ? (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              ) : <span />}
              <p className={`text-xs ${field.state.value.length > 900 ? "text-destructive" : "text-muted-foreground"}`}>
                {field.state.value.length} / 1000
              </p>
            </div>
          </div>
        )}
      </form.Field>

      {/* Timeline */}
      <form.Field name="proposedTimeline">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Proposed Timeline (days)
            </Label>
            <Input
              id={field.name}
              type="number"
              min={1}
              max={90}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              placeholder="e.g. 14"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Attachment URL */}
      <form.Field name="attachmentUrl">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="flex items-center gap-1.5">
              <Link className="size-3.5 text-muted-foreground" />
              Portfolio / Sample Link{" "}
              <span className="text-muted-foreground/60 text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id={field.name}
              type="url"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://drive.google.com/…"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-ig text-white border-transparent hover:opacity-90"
          disabled={isPending}
        >
          {isPending ? "Submitting…" : "Submit Bid"}
        </Button>
      </div>
    </form>
  );
}
