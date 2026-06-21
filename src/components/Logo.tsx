import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

type LogoSize = "xs" | "sm" | "md" | "lg";

const heightClass: Record<LogoSize, string> = {
  xs: "h-6",
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
};

type LogoProps = {
  size?: LogoSize;
  className?: string;
  imgClassName?: string;
};

export function Logo({ size = "md", className, imgClassName }: LogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="FounderBrief"
      className={cn("w-auto object-contain object-left", heightClass[size], imgClassName, className)}
    />
  );
}

type LogoLinkProps = LogoProps & {
  to?: string;
};

export function LogoLink({ to = "/", size = "md", className, imgClassName }: LogoLinkProps) {
  return (
    <Link to={to} className={cn("inline-flex shrink-0 items-center", className)}>
      <Logo size={size} imgClassName={imgClassName} />
    </Link>
  );
}

export { LOGO_SRC };
