import { createPostLink, interlinkPosts, deletePostLink } from "@/lib/api";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../auth/[...nextauth]";
import { HttpMethod } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.POST:
      return createPostLink(req, res, session);
    case HttpMethod.PUT:
      return interlinkPosts(req, res, session);
    case HttpMethod.DELETE:
      return deletePostLink(req, res, session);
    default:
      res.setHeader("Allow", [
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.DELETE,
      ]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
