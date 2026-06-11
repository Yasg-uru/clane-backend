import type { ReactElement, ReactNode } from "react";
import { BarChart3, Globe, Shield, Target, Users, Zap } from "lucide-react";
import { GradientOrb } from "@/components/common/gradient-orb";
import { cn } from "@/lib/utils";

type Feature = {
  icon: ReactNode;
  title: string;
  description: string;
  accentClass: string;
};

const features: Feature[] = [
  {
    icon: <Shield className="size-5" />,
    title: "Escrow Payments",
    description:
      "Funds held securely until deliverables are approved. Brands and creators are both fully protected.",
    accentClass: "from-ig-purple to-ig-red",
  },
  {
    icon: <Target className="size-5" />,
    title: "Smart Matching",
    description:
      "Creators matched by niche, audience demographics, engagement rate, and verified past performance.",
    accentClass: "from-ig-red to-ig-orange",
  },
  {
    icon: <Users className="size-5" />,
    title: "Verified Creators",
    description:
      "Every creator connects their social accounts. Real audience data — no inflated follower counts.",
    accentClass: "from-ig-orange to-ig-purple",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Campaign Analytics",
    description:
      "Track performance, creator metrics, and campaign ROI in one unified brand dashboard.",
    accentClass: "from-ig-purple to-ig-orange",
  },
  {
    icon: <Zap className="size-5" />,
    title: "Fast Bid System",
    description:
      "Receive and review bids within 24 hours. Go from campaign post to live content in days, not weeks.",
    accentClass: "from-ig-red to-ig-purple",
  },
  {
    icon: <Globe className="size-5" />,
    title: "Multi-Platform",
    description:
      "Instagram, YouTube, and more. Connect multiple platforms and manage everything from one place.",
    accentClass: "from-ig-orange to-ig-red",
  },
];

type FeatureCardProps = {
  feature: Feature;
  index: number;
};

function FeatureCard({ feature, index }: FeatureCardProps): ReactElement {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border bg-card p-6",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        "hover:shadow-ig-purple/10 hover:border-ig-purple/30",
        "animate-fade-up",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Gradient icon container */}
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110",
          "bg-gradient-to-br",
          feature.accentClass,
        )}
      >
        {feature.icon}
      </div>

      <div>
        <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>

      {/* Subtle gradient shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shimmer" />
    </div>
  );
}

export function LandingFeatures(): ReactElement {
  return (
    <section id="features" className="relative overflow-hidden py-24 md:py-32">
      {/* Faint background tint */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-muted/20" />
      {/* Gradient smoke */}
      <GradientOrb color="from" className="-right-32 -top-24 h-[500px] w-[500px] opacity-[0.08] blur-[120px] animate-pulse-glow dark:opacity-[0.16]" />
      <GradientOrb color="to"   className="-left-24 bottom-0 h-[400px] w-[400px] opacity-[0.07] blur-[100px] animate-pulse-glow delay-neg-2s dark:opacity-[0.14]" />
      <GradientOrb color="via"  className="left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05] blur-[80px] dark:opacity-[0.09]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Everything You Need
          </p>
          <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-5xl">
            Built for the{" "}
            <span className="text-gradient-ig">creator economy</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            From campaign creation to payment release — every feature is designed to make influencer
            marketing transparent, fast, and fair.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
