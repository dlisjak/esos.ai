import { importCategories } from "@/lib/api/category";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../auth/[...nextauth]";
import { HttpMethod } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function categoryTranslate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    // case HttpMethod.GET:
    //   return getCategoryTranslations(req, res, session);
    case HttpMethod.POST:
      return importCategories(req, res, session);
    // case HttpMethod.DELETE:
    // 	return deleteCategory(req, res, session);
    // case HttpMethod.PUT:
    //   return translateCategory(req, res, session);
    default:
      res.setHeader("Allow", [
        // HttpMethod.GET,
        HttpMethod.POST,
        // HttpMethod.DELETE,
        // HttpMethod.PUT,
      ]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
