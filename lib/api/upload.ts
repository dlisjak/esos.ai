import prisma from '@/lib/prisma';
import multer from 'multer';

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import type { Theme } from '.prisma/client';
import type { Session } from 'next-auth';
import busboy from 'busboy';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { revalidate } from '@/lib/revalidate';
import { getBlurDataURL, placeholderBlurhash } from '@/lib/utils';

import type { WithSitePost } from '@/types';

const s3 = new S3Client({ region: process.env.AWS_BUCKES_REGION });

/**
 * Create Upload
 *
 * Uploads and tinifies and image
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */

export async function createUpload(
	req: NextApiRequest,
	res: NextApiResponse,
	session: Session
): Promise<void | NextApiResponse<Array<Theme> | (Theme | null)>> {
	if (!session.user.id)
		return res.status(500).end('Server failed to get session user ID');

	const bb = busboy({ headers: req.headers });

	bb.on('file', async (_, file, info) => {
		const filename = info.filename;

		try {
			const parallelUploads = new Upload({
				client: s3,
				queueSize: 4,
				partSize: 1024 * 1024 * 5,
				leavePartsOnError: false,
				params: {
					Bucket: process.env.AWS_BUCKES_NAME,
					Key: filename,
					Body: file,
				},
			});
		} catch (e) {
			console.error(e);
		}
	});

	bb.on('close', () => {
		res.status(200).json({ uploaded: true });
	});

	req.pipe(bb);
	return;
}
