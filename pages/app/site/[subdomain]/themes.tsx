import { Toaster } from 'react-hot-toast';
import useSWR from 'swr';

import Layout from '@/components/app/Layout';

import { fetcher } from '@/lib/fetcher';

import type { Theme } from '@prisma/client';

export default function SiteThemes() {
	const { data: themes } = useSWR<Theme[] | null>('/api/theme', fetcher, {
		revalidateOnFocus: false,
	});

	return (
		<Layout>
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 10000,
				}}
			/>
			<div className="max-w-screen-lg pt-4">
				<h1 className="text-4xl mb-8">Themes</h1>
				<div className="grid grid-cols-3 gap-4 mt-4">
					{themes?.map((theme) => (
						<div
							className="relative flex items-center min-w-[20rem] justify-center aspect-square border rounded drop-shadow-md  hover:drop-shadow-xl ease-in-out duration-100 bg-white cursor-pointer"
							key={theme.id}
						>
							<div className="absolute bottom-0 left-0 right-0 p-2 border-t text-center">
								{theme.name}
							</div>
						</div>
					))}
				</div>
			</div>
		</Layout>
	);
}
