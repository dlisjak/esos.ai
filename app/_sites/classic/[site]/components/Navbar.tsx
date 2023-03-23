"use client";

import { useState } from "react";
import Link from "./Link";

interface NavbarProps {
  categories?: any;
  title: string;
}

const Navigation = ({ categories, title }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="navigation sticky top-0 left-0 right-0 z-50 bg-white p-4 drop-shadow">
      <div className="container-2xl container mx-auto flex items-center justify-between">
        <div className="mr-auto text-2xl">
          <Link href="/">{title}</Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
          Menu
        </button>
        <ul
          className={`container-2xl container absolute right-0 left-0 top-[64px] mx-auto flex flex-col bg-white lg:relative lg:top-auto lg:m-0 lg:h-auto lg:w-auto lg:flex-row lg:overflow-visible ${
            isOpen ? "h-auto overflow-visible" : "h-0 overflow-hidden"
          }`}
        >
          {categories &&
            categories?.map(({ title, slug, children }: any) => (
              <li className="dropdown relative mx-2 sm:mx-4" key={slug}>
                <Link
                  href={`/${slug}`}
                  className="flex justify-center rounded p-2 hover:underline"
                >
                  <span>{title}</span>
                </Link>
                <ul className="series-dropdown solid absolute top-8 divide-y border bg-white">
                  {children.map((child: any) => (
                    <li
                      className={`mx-2 border-b lg:border-0`}
                      key={child.slug}
                    >
                      <Link
                        href={`/${slug}/${child.slug}`}
                        className="flex justify-start rounded p-2 hover:underline"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Navigation;
