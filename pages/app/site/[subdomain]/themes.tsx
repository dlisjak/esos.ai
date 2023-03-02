import { Toaster } from 'react-hot-toast';
import useSWR from 'swr';

import Layout from '@/components/app/Layout';

import { fetcher } from '@/lib/fetcher';

import type { Theme } from '@prisma/client';
import Header from '@/components/Layout/Header';
import Container from '@/components/Layout/Container';

export default function SiteThemes() {
	const { data: themes } = useSWR<Theme[] | null>('/api/theme', fetcher, {
		revalidateOnFocus: false,
	});

	return (
		<Layout>
			<Header>
				<h1 className="text-4xl">Themes</h1>
			</Header>
			<Container>
				<div className="my-4 grid gap-y-4">
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
			</Container>
		</Layout>
	);
}
