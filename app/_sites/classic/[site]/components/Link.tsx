"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";

interface LinkProps {
  className?: string;
  href: string;
  lang: string;
  children: any;
}

const Link = ({ className = "", href, lang, children }: LinkProps) => {
  return (
    <NextLink href={`${lang}${href}`} className={className}>
      {children}
    </NextLink>
  );
};

export default Link;
