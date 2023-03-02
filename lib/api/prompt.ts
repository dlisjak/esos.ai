import prisma from '@/lib/prisma';

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import type { Prompt } from '.prisma/client';
import type { Session } from 'next-auth';
import { placeholderBlurhash } from '../utils';

/**
 * Get Prompt
 *
 * Fetches & returns either a single or all user prompts available depending on
 * whether a `promptId` query parameter is provided. If not all themes are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getPrompt(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<Array<Prompt> | (Prompt | null)>> {
	const { promptId } = req.query;

	if (Array.isArray(promptId) || !session.user.id)
		return res
			.status(400)
			.end('Bad request. promptId parameter cannot be an array.');

	if (!session.user.id)
		return res.status(500).end('Server failed to get session user ID');

	try {
		if (promptId) {
			const prompts = await prisma.prompt.findFirst({
				where: {
					id: promptId,
					user: {
						id: session.user.id,
					},
				},
			});

			return res.status(200).json(prompts);
		}

		const prompts = await prisma.prompt.findMany({
			where: {
				user: {
					id: session.user.id,
				},
			},
		});

		return res.status(200).json(prompts);
	} catch (error) {
		console.error(error);
		return res.status(500).end(error);
	}
}

/**
 * Create Prompt
 *
 * Creates a new prompt.
 *
 * Once created, the sites new `prompt` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPrompt(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<{
	prompt: string;
}>> {
	const { name, description, command } = req.body;

	if (!name || typeof command !== 'string' || !session?.user?.id) {
		return res
			.status(400)
			.json({ error: 'Missing or misconfigured site ID or session ID' });
	}

	try {
		const response = await prisma.prompt.create({
			data: {
				name,
				description,
				command,
				image: `/placeholder.png`,
				imageBlurhash: placeholderBlurhash,
				user: {
					connect: {
						id: session.user.id,
					},
				},
			},
		});

		return res.status(201).json({
			prompt: response,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).end(error);
	}
}
