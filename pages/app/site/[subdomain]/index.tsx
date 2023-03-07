import Layout from '@/components/app/Layout';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import { useRouter } from 'next/router';

export default function SiteIndex() {
	const router = useRouter();
	const { subdomain } = router.query;

	return (
		<Layout>
			<Header>
				<div className="flex justify-between items-center">
					<h1 className="text-4xl">{subdomain}</h1>
				</div>
			</Header>
			<Container dark>
				<div className="grid grid-cols-2 gap-y-4 gap-x-4">
					<div className="w-full">
						<h2>Posts</h2>
					</div>
					<div className="w-full">
						<h2>Categories</h2>
					</div>
				</div>
			</Container>
		</Layout>
	);
}
