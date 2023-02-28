import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { urlPath } = req.body;
	res.setHeader(
		'Access-Control-Allow-Origin',
		`${process.env.NEXT_PUBLIC_DOMAIN_SCHEME}://app.${process.env.NEXT_PUBLIC_DOMAIN_URL}`
	);
	res.setHeader('Access-Control-Allow-Methods', 'POST');

	try {
		await res.revalidate(urlPath);

		res.status(200).json({
			message: 'OK',
		});
	} catch (error) {
		res.status(500).json({
			message: `Failed to revalidate "${urlPath}"`,
		});
	}
}
