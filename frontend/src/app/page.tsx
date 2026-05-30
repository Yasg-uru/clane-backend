import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex gap-3">
          <Link href={ROUTES.auth.login} className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </Link>
          <Link href={ROUTES.auth.registerBrand} className={buttonVariants()}>
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center px-4">
        <h1 className="text-5xl font-bold tracking-tight">
          India&apos;s influencer
          <br />
          marketing platform
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Brands post campaigns. Creators bid and collaborate. Campaigns go live — fast.
        </p>
        <div className="flex gap-4">
          <Link href={ROUTES.auth.registerBrand} className={cn(buttonVariants({ size: "lg" }))}>
            I&apos;m a Brand
          </Link>
          <Link
            href={ROUTES.auth.registerCreator}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            I&apos;m a Creator
          </Link>
        </div>
      </main>
    </div>
  );
}
