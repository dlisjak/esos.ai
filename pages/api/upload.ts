import { createUpload } from '@/lib/api/upload';
import { getServerSession } from 'next-auth/next';

import { authOptions } from './auth/[...nextauth]';
import { HttpMethod } from '@/types';

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function post(req: NextApiRequest, res: NextApiResponse) {
	const session = await getServerSession(req, res, authOptions);
	if (!session) return res.status(401).end();

	switch (req.method) {
		case HttpMethod.POST:
			return createUpload(req, res, session);
		// case HttpMethod.DELETE:
		// 	return deleteUpload(req, res, session);
		// case HttpMethod.PUT:
		// 	return updateUpload(req, res, session);
		default:
			res.setHeader('Allow', [
				HttpMethod.POST,
				HttpMethod.DELETE,
				HttpMethod.PUT,
			]);
			return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
