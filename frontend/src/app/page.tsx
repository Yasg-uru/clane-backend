import type { ReactElement } from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage(): ReactElement {
  return (
    <>
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingCta />
      </main>
      <LandingFooter />
    </>
  );
}
