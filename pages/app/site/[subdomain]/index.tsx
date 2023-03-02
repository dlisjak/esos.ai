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
			<Container>
				<div className="my-4 grid gap-y-4"></div>
			</Container>
		</Layout>
	);
}
