import { decrementCredits } from "@/lib/api/decrement";
import { getServerSession } from "next-auth/next";

import { authOptions } from "./auth/[...nextauth]";
import { HttpMethod } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function theme(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    // case HttpMethod.GET:
    //   return getUser(req, res, session);
    case HttpMethod.PUT:
      return decrementCredits(req, res, session);
    default:
      res.setHeader("Allow", [HttpMethod.PUT]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
