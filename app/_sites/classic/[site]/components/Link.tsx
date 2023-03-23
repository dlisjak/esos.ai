"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

interface LinkProps {
  className?: string;
  href: string;
  children: any;
}

const Link = ({ className = "", href, children }: LinkProps) => {
  let lang = "en";

  if (typeof window !== "undefined") {
    lang = document?.querySelector("html")?.lang || "en";
  }

  return (
    <NextLink href={`${lang}${href}`} className={className}>
      {children}
    </NextLink>
  );
};

export default Link;
