"use client";

import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import { step3Schema } from "@/schemas/campaign.schema";
import { CampaignDeliveryType } from "@/types/campaign.types";
import { DELIVERY_OPTIONS } from "@/config/campaign.config";
import { cn } from "@/lib/utils";

const TODAY = new Date();
TODAY.setDate(TODAY.getDate() + 4);
const MIN_DATE = TODAY.toISOString().split("T")[0] ?? "";

export function StepBudget(): ReactElement {
  const { data, updateData, nextStep, prevStep } = useCampaignWizardStore();

  const form = useForm({
    defaultValues: {
      budgetAmount: data.budgetAmount,
      deadline: data.deadline,
      deliveryType: data.deliveryType,
      shootingLat: data.shootingLat,
      shootingLng: data.shootingLng,
      shootingRadiusKm: data.shootingRadiusKm,
    },
    validators: { onSubmit: step3Schema },
    onSubmit: ({ value }) => {
      updateData(value);
      nextStep();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Budget */}
      <form.Field name="budgetAmount">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Campaign Budget (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                ₹
              </span>
              <Input
                id={field.name}
                type="number"
                placeholder="25000"
                min={500}
                max={10000000}
                className="pl-8"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              {[5000, 15000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => field.handleChange(amt)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                    field.state.value === amt
                      ? "border-transparent bg-gradient-ig text-white"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Minimum ₹500 · Maximum ₹1,00,00,000
            </p>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Deadline */}
      <form.Field name="deadline">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Bid Deadline <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              type="date"
              min={MIN_DATE}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Creators must submit bids before this date. Min 3 days from today.
            </p>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Delivery type */}
      <form.Field name="deliveryType">
        {(field) => (
          <div className="space-y-2">
            <Label>
              Delivery Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.handleChange(opt.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    field.state.value === opt.value
                      ? "border-transparent bg-gradient-ig text-white"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5",
                      field.state.value === opt.value
                        ? "text-white/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Shooting location — conditional */}
      <form.Subscribe selector={(s) => s.values.deliveryType}>
        {(deliveryType) =>
          deliveryType === CampaignDeliveryType.ONSITE ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Shooting Location</p>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Enter the GPS coordinates of the shoot location. Use Google Maps → right-click a
                location → copy coordinates.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <form.Field name="shootingLat">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g. 19.0760"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>
                <form.Field name="shootingLng">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g. 72.8777"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
              <form.Field name="shootingRadiusKm">
                {(field) => (
                  <div className="space-y-1">
                    <Label className="text-xs">Acceptable Radius (km) — optional</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 25"
                      min={0}
                      max={500}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>
          ) : null
        }
      </form.Subscribe>

      {/* Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-gradient-ig hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Next: Content
              <ArrowRight className="size-4" />
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
