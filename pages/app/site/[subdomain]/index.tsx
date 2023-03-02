import Layout from '@/components/app/Layout';

export default function SiteIndex() {
	return (
		<Layout>
			<div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
				<div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
					<h1 className=" text-5xl">Overview</h1>
				</div>
				<div className="my-10 grid gap-y-4"></div>
			</div>
		</Layout>
	);
}
