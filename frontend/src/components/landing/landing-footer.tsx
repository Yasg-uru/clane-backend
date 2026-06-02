import type { ReactElement } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/config/routes.config";
import { APP_CONFIG } from "@/config/app.config";

type FooterLink = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "For Brands", href: ROUTES.auth.registerBrand },
      { label: "For Creators", href: ROUTES.auth.registerCreator },
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  },
];

export function LandingFooter(): ReactElement {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Top grid */}
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            {/* Gradient logo */}
            <Link href="/" className="mb-4 inline-flex items-center gap-1 text-xl font-bold">
              <span className="text-gradient-ig">Creator</span>
              <span className="text-foreground">Lane</span>
            </Link>
            <p className="max-w-52 text-sm leading-relaxed text-muted-foreground">
              {APP_CONFIG.description}. Connecting brands with verified creators across India.
            </p>

            {/* Animated gradient accent bar */}
            <div className="mt-5 h-px w-20 bg-gradient-ig-animated" />
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with{" "}
            <span className="text-gradient-ig font-semibold">love</span>{" "}
            in India
          </p>
        </div>
      </div>
    </footer>
  );
}
