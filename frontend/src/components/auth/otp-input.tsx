"use client";

import { OTPInput, SlotProps } from "input-otp";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function Slot({ char, hasFakeCaret, isActive }: SlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-12 items-center justify-center border-2 text-xl font-semibold transition-all rounded-md",
        isActive ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      {char ?? <span className="text-muted-foreground">·</span>}
      {hasFakeCaret && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-5 w-0.5 bg-foreground" />
        </div>
      )}
    </div>
  );
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      containerClassName="flex items-center gap-2"
      render={({ slots }) => (
        <>
          {slots.slice(0, 3).map((slot, i) => (
            <Slot key={i} {...slot} />
          ))}
          <div className="text-muted-foreground font-light">—</div>
          {slots.slice(3).map((slot, i) => (
            <Slot key={i + 3} {...slot} />
          ))}
        </>
      )}
    />
  );
}
