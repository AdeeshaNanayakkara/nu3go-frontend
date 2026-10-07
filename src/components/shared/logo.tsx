import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  variant?: "default" | "white";
}

export function Logo({
  className = "",
  imageClassName = "h-12 sm:h-14 md:h-16 lg:h-18 w-auto object-contain",
  width = 240,
  height = 80,
  variant = "default",
}: LogoProps) {
  const filterClass = variant === "white" ? "brightness-0 invert drop-shadow" : "";

  return (
    <Link
      href={ROUTES.HOME}
      className={`inline-block transition-opacity hover:opacity-90 ${className}`}
    >
      <Image
        src="/images/nu3go_logo.png"
        alt="nu3go logo"
        width={width}
        height={height}
        className={`${filterClass} ${imageClassName}`.trim()}
        priority
      />
    </Link>
  );
}

