import {
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory,
} from '@/lib/api/category';
import { unstable_getServerSession } from 'next-auth/next';

import { authOptions } from './auth/[...nextauth]';
import { HttpMethod } from '@/types';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function category(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await unstable_getServerSession(req, res, authOptions);
	if (!session) return res.status(401).end();

	switch (req.method) {
		case HttpMethod.GET:
			return getCategory(req, res, session);
		case HttpMethod.POST:
			return createCategory(req, res, session);
		case HttpMethod.DELETE:
			return deleteCategory(req, res, session);
		case HttpMethod.PUT:
			return updateCategory(req, res, session);
		default:
			res.setHeader('Allow', [
				HttpMethod.GET,
				HttpMethod.POST,
				HttpMethod.DELETE,
				HttpMethod.PUT,
			]);
			return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
