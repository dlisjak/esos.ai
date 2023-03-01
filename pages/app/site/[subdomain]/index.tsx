import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

import BlurImage from '@/components/BlurImage';
import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

import type { Post, Site } from '@prisma/client';

interface SitePostData {
	posts: Array<Post>;
	site: Site | null;
}

export default function SiteIndex() {
	const router = useRouter();
	const { subdomain: siteId } = router.query;

	const { data } = useSWR<SitePostData>(
		siteId && `/api/post?siteId=${siteId}&published=true`,
		fetcher,
		{
			onSuccess: (data) => !data?.site && router.push('/'),
		}
	);

	return (
		<Layout>
			<div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
				<div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
					<h1 className=" text-5xl">Overview</h1>
				</div>
				<div className="my-10 grid gap-y-10">
					{data?.posts?.map((post) => (
						<Link href={`/post/${post.id}`} key={post.id}>
							<div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
								<div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none">
									{post.image ? (
										<BlurImage
											alt={post.title ?? 'Unknown Thumbnail'}
											width={500}
											height={400}
											className="h-full object-cover"
											src={post.image}
										/>
									) : (
										<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
											?
										</div>
									)}
								</div>
								<div className="relative p-10">
									<h2 className=" text-3xl">{post.title}</h2>
									<p className="text-base my-5 line-clamp-3">
										{post.description}
									</p>
									<Link
										className=" px-3 py-1 tracking-wide rounded bg-gray-200 text-gray-600 absolute bottom-5 left-10 whitespace-nowrap"
										href={`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://${data.site?.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_URL}/${post.slug}`}
										onClick={(e) => e.stopPropagation()}
										rel="noreferrer"
										target="_blank"
									>
										{data.site?.subdomain}.{process.env.NEXT_PUBLIC_DOMAIN_URL}/
										{post.slug} ↗
									</Link>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</Layout>
	);
}
