import prisma from '@/lib/prisma';

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import type { Theme } from '.prisma/client';
import type { Session } from 'next-auth';
import { revalidate } from '@/lib/revalidate';
import { getBlurDataURL, placeholderBlurhash } from '@/lib/utils';

import type { WithSitePost } from '@/types';
/**
 * Get Theme
 *
 * Fetches & returns either a single or all themes available depending on
 * whether a `themeId` query parameter is provided. If not all themes are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getTheme(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<Array<Theme> | (Theme | null)>> {
	const { themeId } = req.query;

	if (Array.isArray(themeId))
		return res
			.status(400)
			.end('Bad request. themeId parameter cannot be an array.');

	if (!session.user.id)
		return res.status(500).end('Server failed to get session user ID');

	try {
		if (themeId) {
			const themes = await prisma.theme.findFirst({
				where: {
					id: themeId,
				},
			});

			return res.status(200).json(themes);
		}

		const themes = await prisma.theme.findMany({});

		return res.status(200).json(themes);
	} catch (error) {
		console.error(error);
		return res.status(500).end(error);
	}
}
