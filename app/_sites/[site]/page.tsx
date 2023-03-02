import Link from 'next/link';

import BlurImage from '@/components/BlurImage';
import BlogCard from '@/components/BlogCard';
import prisma from '@/lib/prisma';

import type { _SiteData } from '@/types';
import { placeholderBlurhash, toDateString } from '@/lib/utils';
import Loader from '@/components/app/Loader';
import { Metadata } from 'next';

export const dynamicParams = true;

export async function generateStaticParams() {
	const [subdomains, customDomains] = await Promise.all([
		prisma.site.findMany({
			select: {
				subdomain: true,
			},
		}),
		prisma.site.findMany({
			where: {
				NOT: {
					customDomain: null,
				},
			},
			select: {
				customDomain: true,
			},
		}),
	]);

	const allPaths = [
		...subdomains.map(({ subdomain }) => subdomain),
		...customDomains.map(({ customDomain }) => customDomain),
	].filter((path) => path) as Array<string>;

	const paths = allPaths.map((path) => ({
		site: path,
	}));

	return paths;
}

const getData = async (site) => {
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

	const data = await prisma.site.findUnique({
		where: filter,
		include: {
			user: true,
			posts: {
				where: {
					published: true,
				},
				orderBy: [
					{
						createdAt: 'desc',
					},
				],
			},
		},
	});

	return data;
};

export async function generateMetadata({ params }): Promise<Metadata> {
	const data = await getData(params.site);
	if (!data) return { title: 'ESOS AI', description: 'ESOS AI App' };
	return { title: data.name, description: data.description };
}

export default async function Index({ params }) {
	const data = await getData(params.site);
	if (!data) return <Loader />;

	return (
		<>
			<div className="w-full mb-20">
				{data.posts.length > 0 ? (
					<div className="w-full max-w-screen-lg lg:w-5/6 mx-auto md:mb-28">
						<Link href={`/${data.posts[0].slug}`}>
							<div className="relative group h-80 sm:h-150 w-full mx-auto overflow-hidden lg:rounded">
								{data.posts[0].image ? (
									<BlurImage
										alt={data.posts[0].title ?? ''}
										blurDataURL={
											data.posts[0].imageBlurhash ?? placeholderBlurhash
										}
										className="group-hover:scale-105 group-hover:duration-300 h-full w-full object-cover"
										width={1300}
										height={630}
										placeholder="blur"
										src={data.posts[0].image}
									/>
								) : (
									<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
										?
									</div>
								)}
							</div>
							<div className="mt-10 w-5/6 mx-auto lg:w-full">
								<h2 className=" text-4xl md:text-6xl my-10">
									{data.posts[0].title}
								</h2>
								<p className="text-base md:text-lg w-full lg:w-2/3">
									{data.posts[0].description}
								</p>
								<div className="flex justify-start items-center space-x-4 w-full">
									<div className="relative w-8 h-8 flex-none rounded-full overflow-hidden">
										{data.user?.image ? (
											<BlurImage
												alt={data.user?.name ?? 'User Avatar'}
												width={100}
												height={100}
												className="w-full h-full object-cover"
												src={data.user?.image}
											/>
										) : (
											<div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
												?
											</div>
										)}
									</div>
									<p className="inline-block font-semibold text-sm md:text-base align-middle ml-3 whitespace-nowrap">
										{data.user?.name}
									</p>
									<div className="border-l border-gray-600 h-6" />
									<p className="text-sm md:text-base font-light text-gray-500 w-10/12 m-auto my-5">
										{toDateString(data.posts[0].createdAt)}
									</p>
								</div>
							</div>
						</Link>
					</div>
				) : (
					<div className="flex flex-col justify-center items-center py-20">
						<BlurImage
							src="/empty-state.png"
							alt="No Posts"
							width={613}
							height={420}
							placeholder="blur"
							blurDataURL={placeholderBlurhash}
						/>
						<p className="text-2xl  text-gray-600">No posts yet.</p>
					</div>
				)}
			</div>

			{data.posts.length > 1 && (
				<div className="mx-5 lg:mx-24 2xl:mx-auto mb-20 max-w-screen-lg">
					<h2 className="text-4xl mb-10">More stories</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 w-full">
						{data.posts.slice(1).map((metadata, index) => (
							<BlogCard key={index} data={metadata} />
						))}
					</div>
				</div>
			)}
		</>
	);
}
