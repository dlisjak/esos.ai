import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote/rsc';

import prisma from '@/lib/prisma';

import { toDateString } from '@/lib/utils';
import BlogCard from '@/components/BlogCard';

export const dynamicParams = true;

async function getMdxSource(postContents: string) {
	// Serialize the content string into MDX
	const mdxSource = await serialize(postContents);

	return mdxSource;
}

export async function generateStaticParams() {
	const posts = await prisma.post.findMany({
		where: {
			published: true,
		},
		select: {
			slug: true,
			site: {
				select: {
					subdomain: true,
					customDomain: true,
				},
			},
		},
	});

	const paths = posts.flatMap((post) => {
		if (post.site === null || post.site.subdomain === null) return {};

		if (post.site.customDomain) {
			return {
				site: post.site.customDomain,
				slug: post.slug,
			};
		} else {
			return {
				site: post.site.subdomain,
				slug: post.slug,
			};
		}
	});

	return paths;
}

const getData = async (params) => {
	if (!params) throw new Error('No path parameters found');

	const { site, slug } = params;

	let filter: {
		subdomain?: string;
		customDomain?: string;
	} = {
		subdomain: site,
	};

	if (site.includes('.')) {
		filter = {
			customDomain: site,
		};
	}

	const data = await prisma.post.findFirst({
		where: {
			site: {
				...filter,
			},
			slug,
		},
		include: {
			site: {
				include: {
					user: true,
				},
			},
		},
	});

	const [mdxSource, adjacentPosts] = await Promise.all([
		getMdxSource(data?.content ?? ''),
		prisma.post.findMany({
			where: {
				site: {
					...filter,
				},
				published: true,
				NOT: {
					id: data?.id,
				},
			},
			select: {
				slug: true,
				title: true,
				createdAt: true,
				description: true,
				image: true,
				imageBlurhash: true,
			},
		}),
	]);

	return {
		...data,
		mdxSource,
		adjacentPosts,
	};
};

export default async function Post({ params }) {
	const data = await getData(params);

	const meta = {
		logo: '/logo.png',
		title: data.title,
	};

	return (
		<>
			<div className="flex flex-col justify-center items-center">
				<div className="text-center w-full m-auto">
					<p className="text-sm md:text-base font-light text-gray-500 w-10/12 m-auto my-5">
						{toDateString(data?.createdAt)}
					</p>
					<h1 className="font-bold text-3xl  md:text-6xl mb-10 text-gray-800">
						{data?.title}
					</h1>
				</div>
			</div>
			<article
				className="w-11/12 sm:w-3/4 m-auto prose prose-md sm:prose-lg"
				suppressHydrationWarning={true}
			>
				<MDXRemote source={data?.content} />
			</article>

			{data?.adjacentPosts.length > 0 && (
				<div className="relative mt-10 sm:mt-20 mb-20">
					<div
						className="absolute inset-0 flex items-center"
						aria-hidden="true"
					>
						<div className="w-full border-t border-gray-300" />
					</div>
					<div className="relative flex justify-center">
						<span className="px-2 bg-white text-sm text-gray-500">
							Continue Reading
						</span>
					</div>
				</div>
			)}
			{data?.adjacentPosts && (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 mx-5 lg:mx-12 2xl:mx-auto mb-20 max-w-screen-xl">
					{data?.adjacentPosts.map((data, index) => (
						<BlogCard key={index} data={data} />
					))}
				</div>
			)}
		</>
	);
}
