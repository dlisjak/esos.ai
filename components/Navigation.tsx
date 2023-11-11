import Image from "next/image";
import Link from "next/link";

import LOGO from "../public/logo_icon.svg";

const Navigation = () => {
  return (
    <div className="relative top-0 left-0 right-0 z-50 flex bg-black py-2 text-white">
      <div className="container mx-auto flex items-center justify-center px-4">
        <Link href="/">
          <Image src={LOGO} alt="Logo" width={50} height={50} />
        </Link>
        <ul className="ml-auto flex space-x-4">
          <li className="hover:underline">
            <Link href="https://www.youtube.com/@aiautoblogs" target="_blank">
              How To
            </Link>
          </li>
          <li className="hover:underline">
            <Link
              href="https://www.facebook.com/groups/1918730975153813"
              target="_blank"
            >
              Support
            </Link>
          </li>
          <li className="hover:underline">
            <Link href="/refund-policy">Refund Policy</Link>
          </li>
          <li className="hover:underline">
            <Link href="/terms-of-service">Terms of Service</Link>
          </li>
          <li className="hover:underline">
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navigation;
