import Link from 'next/link';
import { useRouter } from 'next/router';

const TopNavLink = ({ children, href }) => {
	const router = useRouter();

	const isActive = router.asPath === href;

	return (
		<Link
			href={href}
			className={`flex items-center rounded px-3 py-1 hover:bg-slate-200 ${
				isActive ? 'bg-slate-100' : ''
			}`}
		>
			{children}
		</Link>
	);
};

export default TopNavLink;
