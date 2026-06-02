import type { ReactElement } from "react";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserRole = "Brand" | "Creator";

type Testimonial = {
  quote: string;
  name: string;
  roleLabel: string;
  tag: UserRole;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "We ran 3 campaigns in our first month. The escrow system gave us complete confidence — no more chasing creators for deliverables.",
    name: "Priya Sharma",
    roleLabel: "Marketing Head · StyleKart",
    tag: "Brand",
  },
  {
    quote:
      "As a mid-tier creator, finding the right brand deals was tough. CreatorLane changed that — I earned ₹80,000 last month alone.",
    name: "Arjun Kapoor",
    roleLabel: "Lifestyle Creator · 180K followers",
    tag: "Creator",
  },
  {
    quote:
      "Real-time bids, creator analytics, collateral review — everything in one place. My team's workflow is 10x faster.",
    name: "Rohit Mehta",
    roleLabel: "Founder · FitLife Supplements",
    tag: "Brand",
  },
  {
    quote:
      "I bid on a campaign at 10 PM and had a confirmed collab by morning. The speed is unmatched by any platform I've tried.",
    name: "Sneha Verma",
    roleLabel: "Food Creator · 95K followers",
    tag: "Creator",
  },
  {
    quote:
      "We discovered micro-influencers with 10x better engagement than macro ones we used before. ROI went through the roof.",
    name: "Aisha Khan",
    roleLabel: "Digital Lead · Urban Closet",
    tag: "Brand",
  },
  {
    quote:
      "Razorpay integration means earnings hit my bank within days. No more NET-30 terms from agencies. Game changer.",
    name: "Vikram Singh",
    roleLabel: "Tech Creator · 220K subscribers",
    tag: "Creator",
  },
];

type TestimonialCardProps = {
  testimonial: Testimonial;
  index: number;
};

function TestimonialCard({ testimonial, index }: TestimonialCardProps): ReactElement {
  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-5 rounded-2xl border bg-card p-6",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ig-purple/10",
        "hover:border-ig-purple/20",
        "animate-fade-up",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Gradient top accent line */}
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-ig opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Quote icon */}
      <Quote className="size-6 text-ig-purple/40 transition-colors duration-300 group-hover:text-ig-purple/70" />

      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-ig-orange text-ig-orange" />
        ))}
      </div>

      {/* Quote text */}
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-1 border-t border-border/50">
        <div className="ring-gradient-ig rounded-full p-[1.5px]">
          <Avatar className="size-8">
            <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{testimonial.name}</p>
          <p className="truncate text-xs text-muted-foreground">{testimonial.roleLabel}</p>
        </div>
        <Badge
          variant={testimonial.tag === "Brand" ? "default" : "outline"}
          className="shrink-0 text-[10px]"
        >
          {testimonial.tag}
        </Badge>
      </div>
    </div>
  );
}

export function LandingTestimonials(): ReactElement {
  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Real Results
          </p>
          <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-5xl">
            Loved by brands{" "}
            <span className="text-gradient-ig">and creators</span>
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Hundreds of successful campaigns. Real creators. Real results. Here&apos;s what they
            say.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
