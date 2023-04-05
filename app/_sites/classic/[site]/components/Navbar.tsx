"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "./Link";

import { Image as ImageType } from "@prisma/client";

interface NavigationProps {
  categories: any;
  logo: ImageType | null;
  site: string;
  lang: string;
}

const Navigation = ({ categories, site, logo, lang }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="navigation top-0 left-0 right-0 z-50 bg-white py-2 px-4 drop-shadow">
      <div className="container mx-auto flex max-w-screen-xl items-center justify-between">
        <Link className="flex items-center" href="/" lang={lang}>
          {logo && (
            <Image
              src={logo?.src ?? ""}
              alt={`${site} logo`}
              height={70}
              width={70}
            />
          )}
          <p className="ml-2 text-xl capitalize hover:underline">{site}</p>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
          Menu
        </button>
        <ul
          className={`absolute right-0 left-0 top-[64px] mx-auto flex flex-col bg-white lg:relative lg:top-auto lg:m-0 lg:h-auto lg:w-auto lg:flex-row lg:overflow-visible ${
            isOpen ? "h-auto overflow-visible" : "h-0 overflow-hidden"
          }`}
        >
          {categories &&
            categories?.map(({ title, slug }: any) => (
              <li className="dropdown relative mx-2 sm:mx-4" key={slug}>
                <Link
                  lang={lang}
                  href={`/${slug}`}
                  className="flex justify-center rounded p-2 hover:underline"
                >
                  <span>{title}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Navigation;
