import Link from 'next/link';
import { useRouter } from 'next/router';

const NavLink = ({ children, href }) => {
	const router = useRouter();

	const isActive = router.pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={`flex items-center px-3 py-1 border-b-2 py-3 hover:border-black
      ${isActive ? 'border-black' : 'border-transparent'}
      `}
		>
			{children}
		</Link>
	);
};

export default NavLink;
