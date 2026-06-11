import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-bold text-xl", className)}>
      <span className="text-primary">Creator</span>
      <span>Lane</span>
    </Link>
  );
}
