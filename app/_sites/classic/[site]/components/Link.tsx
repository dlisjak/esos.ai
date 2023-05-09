import NextLink from "next/link";

interface LinkProps {
  className?: string;
  href: string;
  lang: string;
  children: any;
}

const Link = ({ className = "", href, lang = "", children }: LinkProps) => {
  const url = `/${lang}/${href}`.replace("//", "/");

  return (
    <NextLink href={url} className={className}>
      {children}
    </NextLink>
  );
};

export default Link;
