import {
	getAccessToken,
	addAccessToken,
	removeAccessToken,
} from '@/lib/api/prompt';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '../auth/[...nextauth]';
import { HttpMethod } from '@/types';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function prompt(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session) return res.status(401).end();

	switch (req.method) {
		case HttpMethod.GET:
			return getAccessToken(req, res, session);
		case HttpMethod.POST:
			return addAccessToken(req, res, session);
		case HttpMethod.DELETE:
			return removeAccessToken(req, res, session);
		default:
			res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST]);
			return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
