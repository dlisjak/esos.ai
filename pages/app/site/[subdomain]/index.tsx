import Layout from '@/components/app/Layout';

export default function SiteIndex() {
	return (
		<Layout>
			<div className="pt-4 max-w-screen-lg mx-auto">
				<div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
					<h1 className=" text-4xl">Overview</h1>
				</div>
				<div className="my-10 grid gap-y-4"></div>
			</div>
		</Layout>
	);
}
