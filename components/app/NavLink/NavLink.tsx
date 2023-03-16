import Link from "next/link";
import { useRouter } from "next/router";

const NavLink = ({ children, href }: any) => {
  const router = useRouter();

  const isActive = router.pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center border-b-2 px-3 py-1 py-3 hover:border-black
      ${isActive ? "border-black" : "border-transparent"}
      `}
    >
      {children}
    </Link>
  );
};

export default NavLink;
