import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { signOut } from 'next-auth/react';
import Loader from './Loader';
import useRequireAuth from '../../lib/useRequireAuth';

import type { WithChildren } from '@/types';
import TopNavLink from './NavLink/TopNavLink';

interface LayoutProps extends WithChildren {
	siteId?: string;
}

export default function Layout({ children }: LayoutProps) {
	const router = useRouter();
	const { subdomain, categoryId } = router.query;

	const logo = '/favicon.ico';

	const sitePage = router.pathname.startsWith('/app/site/[subdomain]');
	const postPage = router.pathname.startsWith('/app/site/[subdomain]/posts');
	const categoriesPage = router.pathname.startsWith(
		'/app/site/[subdomain]/categories'
	);
	const themePage = router.pathname.startsWith('/app/site/[subdomain]/themes');
	const draftsPage = router.pathname.startsWith(
		'/app/site/[subdomain]/posts/drafts'
	);
	const categoryPage = router.pathname.startsWith(
		'/app/site/[subdomain]/categories/[categoryId]'
	);
	const categoryPostsPage = router.pathname.startsWith(
		'/app/site/[subdomain]/categories/[categoryId]/posts'
	);
	const categoryDraftsPage = router.pathname.startsWith(
		'/app/site/[subdomain]/categories/[categoryId]/drafts'
	);
	const postEditPage = router.pathname.startsWith(
		'/app/site/[subdomain]/posts/[postId]'
	);
	const categoryPostsEditPage = router.pathname.startsWith(
		'/app/site/[subdomain]/categories/[categoryId]/posts/[postId]'
	);
	const rootPage = !sitePage && !postPage && !categoryPage;
	const tab = rootPage
		? router.asPath.split('/')[1]
		: router.asPath.split('/')[3];

	const title = `${subdomain || 'Dashboard'} | ESOS AI`;
	const description =
		'Create a fullstack application with multi-tenancy and custom domains support using Next.js, Prisma, and PostgreSQL';

	const session = useRequireAuth();
	if (!session) return <Loader />;

	return (
		<>
			<div>
				<Head>
					<title>{title}</title>
					<link rel="icon" href={logo} />
					<link rel="shortcut icon" type="image/x-icon" href={logo} />
					<link rel="apple-touch-icon" sizes="180x180" href={logo} />
					<meta name="theme-color" content="#7b46f6" />

					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />

					<meta itemProp="name" content={title} />
					<meta itemProp="description" content={description} />
					<meta itemProp="image" content={logo} />
					<meta name="description" content={description} />
					<meta property="og:title" content={title} />
					<meta property="og:description" content={description} />
					<meta property="og:image" content={logo} />
					<meta property="og:type" content="website" />

					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:site" content="@Vercel" />
					<meta name="twitter:creator" content="@StevenTey" />
					<meta name="twitter:title" content={title} />
					<meta name="twitter:description" content={description} />
					<meta name="twitter:image" content={logo} />
				</Head>
				<div className="fixed left-0 right-0 h-16 bg-white border-gray-200 border-b px-4 z-50">
					<div className="flex justify-between items-center h-full max-w-screen-xl mx-auto">
						<div className="flex items-center">
							{session.user && session.user.image && (
								<div className="h-8 w-8 inline-block rounded-full overflow-hidden align-middle">
									<Image
										src={session.user.image}
										width={40}
										height={40}
										alt={session.user.name ?? 'User avatar'}
									/>
								</div>
							)}
							<span className="sm:block inline-block ml-3 font-medium truncate">
								{session.user?.name}
							</span>
							<div className="h-8 border border-gray-300 ml-6 mr-2" />
							<TopNavLink href="/">Sites</TopNavLink>
							<TopNavLink href="/prompts">Prompts</TopNavLink>
						</div>
						<button
							className="text-gray-500 hover:text-gray-700 transition-all ease-in-out duration-150"
							onClick={() => signOut()}
						>
							Logout
						</button>
					</div>
				</div>
				{sitePage && (
					<div className="fixed left-0 right-0 top-16  border-b bg-white border-gray-200 px-4 z-50">
						<div className="flex justify-between items-center max-w-screen-xl mx-auto">
							<Link href="/" className="ml-3 block">
								← All Sites
							</Link>
							<div className="flex justify-between items-center space-x-8">
								<Link
									href={`/site/${subdomain}`}
									className={`border-b-2 ${
										!tab ? 'border-black' : 'border-transparent'
									} py-3`}
								>
									Overview
								</Link>
								<Link
									href={`/site/${subdomain}/posts`}
									className={`border-b-2 ${
										postPage ? 'border-black' : 'border-transparent'
									} py-3`}
								>
									Posts
								</Link>
								<Link
									href={`/site/${subdomain}/categories`}
									className={`border-b-2 ${
										categoriesPage ? 'border-black' : 'border-transparent'
									} py-3`}
								>
									Categories
								</Link>
								<Link
									href={`/site/${subdomain}/themes`}
									className={`border-b-2 ${
										themePage ? 'border-black' : 'border-transparent'
									} py-3`}
								>
									Themes
								</Link>
								<Link
									href={`/site/${subdomain}/settings`}
									className={`border-b-2 ${
										tab == 'settings' ? 'border-black' : 'border-transparent'
									} py-3`}
								>
									Settings
								</Link>
							</div>
							<div>{subdomain}</div>
						</div>
					</div>
				)}
				{postPage && (
					<div className="fixed left-0 right-0 top-[7.2rem] border-b bg-white border-gray-200 px-4 z-50">
						<div className="flex justify-center items-center space-x-16 max-w-screen-lg mx-auto">
							<Link
								href={`/site/${subdomain}/posts`}
								className={`border-b-2 ${
									postPage && !draftsPage
										? 'border-black'
										: 'border-transparent'
								} py-3`}
							>
								Published
							</Link>
							<Link
								href={`/site/${subdomain}/posts/drafts`}
								className={`border-b-2 ${
									draftsPage ? 'border-black' : 'border-transparent'
								} py-3`}
							>
								Drafts
							</Link>
						</div>
					</div>
				)}
				{categoryPage && (
					<div className="fixed left-0 right-0 top-[7.2rem] border-b bg-white border-gray-200 z-50">
						<div className="flex justify-center items-center space-x-16 max-w-screen-lg mx-auto">
							<Link
								href={`/site/${subdomain}/categories/${categoryId}/posts`}
								className={`border-b-2 ${
									categoryPostsPage ? 'border-black' : 'border-transparent'
								} py-3`}
							>
								Posts
							</Link>
							<Link
								href={`/site/${subdomain}/categories/${categoryId}`}
								className={`border-b-2 ${
									categoryPage && !categoryPostsPage && !categoryDraftsPage
										? 'border-black'
										: 'border-transparent'
								} py-3`}
							>
								Edit Category
							</Link>
						</div>
					</div>
				)}
				<div
					className={
						categoryPostsEditPage ||
						categoryPostsPage ||
						postEditPage ||
						categoryPage ||
						postPage
							? 'pt-40'
							: sitePage
							? 'pt-28'
							: 'pt-16'
					}
				>
					{children}
				</div>
			</div>
		</>
	);
}
