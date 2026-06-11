import type { ReactElement, ReactNode } from "react";
import { CheckCircle, Megaphone, PenLine, Search, Trophy, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientOrb } from "@/components/common/gradient-orb";
import { cn } from "@/lib/utils";

type Step = {
  icon: ReactNode;
  title: string;
  description: string;
};

const brandSteps: Step[] = [
  {
    icon: <PenLine className="size-5" />,
    title: "Post a Campaign",
    description:
      "Define goals, budget, target audience, and deliverables. Set your timeline and content requirements in minutes.",
  },
  {
    icon: <Search className="size-5" />,
    title: "Review Creator Bids",
    description:
      "Receive bids from matched creators. Browse portfolios, social stats, and proposals before choosing your fit.",
  },
  {
    icon: <CheckCircle className="size-5" />,
    title: "Approve & Pay Securely",
    description:
      "Funds held in escrow on confirmation. Approve deliverables, then release payment — zero risk, full control.",
  },
];

const creatorSteps: Step[] = [
  {
    icon: <Megaphone className="size-5" />,
    title: "Discover Campaigns",
    description:
      "Browse active campaigns matching your niche, audience, and platform. Open access — no gatekeeping.",
  },
  {
    icon: <Trophy className="size-5" />,
    title: "Submit Your Bid",
    description:
      "Pitch your rate, timeline, and creative angle. Let your portfolio and past collabs do the talking.",
  },
  {
    icon: <Wallet className="size-5" />,
    title: "Deliver & Earn",
    description:
      "Complete the deliverables, get the brand's approval, and withdraw your earnings via Razorpay — fast.",
  },
];

type StepRowProps = {
  step: Step;
  index: number;
  isLast: boolean;
};

function StepRow({ step, index, isLast }: StepRowProps): ReactElement {
  return (
    <div className="flex gap-5">
      {/* Number + connector */}
      <div className="flex flex-col items-center pt-1">
        <div
          className={cn(
            "relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
            "bg-gradient-ig shadow-lg shadow-ig-purple/30",
          )}
        >
          {index + 1}
          {/* Outer ping ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-ig opacity-30 animate-ping-slow" />
        </div>
        {!isLast && (
          <div className="mt-2 w-px flex-1 bg-gradient-to-b from-ig-purple/40 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-8", isLast && "pb-1")}>
        <div className="mb-1.5 flex items-center gap-2 text-ig-orange">{step.icon}</div>
        <h3 className="mb-1.5 text-sm font-semibold">{step.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </div>
  );
}

export function LandingHowItWorks(): ReactElement {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 md:py-32">
      {/* Gradient smoke */}
      <GradientOrb color="via"  className="-left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 opacity-[0.07] blur-[120px] dark:opacity-[0.13]" />
      <GradientOrb color="to"   className="-right-40 top-1/3 h-[400px] w-[400px] opacity-[0.06] blur-[100px] dark:opacity-[0.11]" />
      <GradientOrb color="from" className="bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 opacity-[0.05] blur-[80px] dark:opacity-[0.09]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Simple Process
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            How{" "}
            <span className="text-gradient-ig">CreatorLane</span>{" "}
            Works
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Whether you&apos;re a brand searching for creators or a creator chasing your next
            campaign — every step is effortless.
          </p>
        </div>

        <Tabs defaultValue="brand" className="mx-auto max-w-lg">
          <TabsList className="mx-auto mb-10 grid w-full grid-cols-2">
            <TabsTrigger value="brand">For Brands</TabsTrigger>
            <TabsTrigger value="creator">For Creators</TabsTrigger>
          </TabsList>

          <TabsContent value="brand">
            {brandSteps.map((step, i) => (
              <StepRow
                key={step.title}
                step={step}
                index={i}
                isLast={i === brandSteps.length - 1}
              />
            ))}
          </TabsContent>

          <TabsContent value="creator">
            {creatorSteps.map((step, i) => (
              <StepRow
                key={step.title}
                step={step}
                index={i}
                isLast={i === creatorSteps.length - 1}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
