"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

interface LinkProps {
  className?: string;
  href: string;
  children: any;
}

const Link = ({ className = "", href, children }: LinkProps) => {
  const lang = usePathname()?.substring(0, 3);

  return (
    <NextLink href={`${lang}${href}`} className={className}>
      {children}
    </NextLink>
  );
};

export default Link;
