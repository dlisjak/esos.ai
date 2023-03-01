import prisma from '@/lib/prisma';

import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import type { Category, Theme } from '.prisma/client';
import type { Session } from 'next-auth';
import { revalidate } from '@/lib/revalidate';
import { getBlurDataURL, placeholderBlurhash } from '@/lib/utils';

import type { WithSitePost } from '@/types';

/**
 * Get Category
 *
 * Fetches & returns either a single or all categories available depending on
 * whether a `siteId` query parameter is provided. If not all categories are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getCategory(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<Array<Theme> | (Theme | null)>> {
	const { siteId, categoryId } = req.query;

	if (Array.isArray(categoryId) || Array.isArray(siteId) || !session.user.id)
		return res.status(400).end('Bad request. Query parameters are not valid.');

	try {
		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: {
					id: categoryId,
					site: {
						user: {
							id: session.user.id,
						},
					},
				},
			});

			return res.status(200).json(category);
		}

		const site = await prisma.site.findFirst({
			where: {
				id: siteId,
				user: {
					id: session.user.id,
				},
			},
		});

		const categories = !site
			? []
			: await prisma.category.findMany({
					where: {
						siteId: `${siteId}`,
					},
					orderBy: {
						createdAt: 'desc',
					},
			  });

		return res.status(200).json(categories);
	} catch (error) {
		console.error(error);
		return res.status(500).end(error);
	}
}

/**
 * Create Category
 *
 * Creates a new category from a provided `siteId` query parameter.
 *
 * Once created, the sites new `categoryId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createCategory(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<Array<Theme> | (Theme | null)>> {
	const { siteId } = req.query;
	const { title, slug } = req.body;

	if (!siteId || typeof siteId !== 'string' || !session?.user?.id) {
		return res
			.status(400)
			.json({ error: 'Missing or misconfigured site ID or session ID' });
	}

	const site = await prisma.site.findFirst({
		where: {
			id: siteId,
			user: {
				id: session.user.id,
			},
		},
	});
	if (!site) return res.status(404).end('Site not found');

	try {
		const response = await prisma.category.create({
			data: {
				image: `/placeholder.png`,
				imageBlurhash: placeholderBlurhash,
				title,
				slug,
				site: {
					connect: {
						id: siteId,
					},
				},
			},
		});

		return res.status(201).json({
			categoryId: response.id,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).end(error);
	}
}

/**
 * Update Post
 *
 * Updates a post & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - description
 *  - slug
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateCategory(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<Category>> {
	const { id, title, description, slug, image } = req.body;

	if (!id || typeof id !== 'string' || !session?.user?.id) {
		return res
			.status(400)
			.json({ error: 'Missing or misconfigured site ID or session ID' });
	}

	const site = await prisma.site.findFirst({
		where: {
			categories: {
				some: {
					id,
				},
			},
			user: {
				id: session.user.id,
			},
		},
	});
	if (!site) return res.status(404).end('Site not found');

	try {
		const category = await prisma.category.update({
			where: {
				id: id,
			},
			data: {
				title,
				description,
				slug,
				image,
				imageBlurhash: (await getBlurDataURL(image)) ?? undefined,
			},
		});

		return res.status(200).json(category);
	} catch (error) {
		console.error(error);
		return res.status(500).end(error);
	}
}
