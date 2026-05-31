"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRegisterCreator, useInitiateSocialAuth } from "@/hooks/auth/useAuth";
import { creatorRegisterSchema } from "@/schemas/auth.schema";
import { SocialProvider, UserRole } from "@/types";

const NICHE_SUGGESTIONS = [
  "Fashion",
  "Beauty",
  "Fitness",
  "Food",
  "Travel",
  "Tech",
  "Finance",
  "Gaming",
  "Education",
  "Lifestyle",
  "Parenting",
  "Comedy",
];

type FieldErrorProps = { errors: unknown[] };

function FieldError({ errors }: FieldErrorProps): React.ReactElement | null {
  if (!errors.length) return null;
  return (
    <p className="text-sm font-medium text-destructive">{String(errors[0])}</p>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="ig-reg-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-reg-grad)" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="white" />
    </svg>
  );
}

export function RegisterCreatorForm(): React.ReactElement {
  const [showPassword, setShowPassword] = useState(false);
  const [nicheInput, setNicheInput] = useState("");
  const { mutate: registerCreator, isPending } = useRegisterCreator();
  const { mutate: initiateSocialAuth, isPending: isSocialPending } = useInitiateSocialAuth();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      city: "",
      instagramHandle: "",
      instagramFollowers: 0,
      niche: [] as string[],
    },
    validators: { onSubmit: creatorRegisterSchema },
    onSubmit: async ({ value }) => registerCreator(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={isSocialPending}
        onClick={() =>
          initiateSocialAuth({ role: UserRole.CREATOR, provider: SocialProvider.INSTAGRAM })
        }
      >
        {isSocialPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <InstagramIcon />}
        Sign up with Instagram
      </Button>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">Or sign up with email</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="fullName">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Full Name</Label>
              <Input
                id={field.name}
                placeholder="Arjun Mehta"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="city">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>City</Label>
              <Input
                id={field.name}
                placeholder="Delhi"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              type="email"
              placeholder="arjun@gmail.com"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Password</Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, uppercase, number, symbol"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="instagramHandle">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Instagram Handle</Label>
              <Input
                id={field.name}
                placeholder="@arjun.creates"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="instagramFollowers">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Followers</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="25000"
                min={0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(parseInt(e.target.value, 10) || 0)
                }
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="niche">
        {(field) => {
          const niches = field.state.value;

          function addNiche(value: string): void {
            const trimmed = value.trim();
            if (!trimmed || niches.includes(trimmed)) return;
            field.handleChange([...niches, trimmed]);
            setNicheInput("");
          }

          function removeNiche(niche: string): void {
            field.handleChange(niches.filter((n) => n !== niche));
          }

          return (
            <div className="space-y-2">
              <Label>Niches</Label>
              <p className="text-sm text-muted-foreground">
                Add at least one niche that describes your content.
              </p>
              <div className="flex flex-wrap gap-2">
                {niches.map((niche) => (
                  <Badge key={niche} variant="secondary" className="gap-1 pr-1">
                    {niche}
                    <button
                      type="button"
                      onClick={() => removeNiche(niche)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a niche and press Enter"
                  value={nicheInput}
                  list="niche-suggestions"
                  onChange={(e) => setNicheInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNiche(nicheInput);
                    }
                  }}
                />
                <datalist id="niche-suggestions">
                  {NICHE_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addNiche(nicheInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FieldError errors={field.state.meta.errors} />
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isPending || isSubmitting}
          >
            {(isPending || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Creator Account
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
