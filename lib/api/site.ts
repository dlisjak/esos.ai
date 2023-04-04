import cuid from "cuid";
import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import fs from "fs";
import path from "path";

import prisma from "@/lib/prisma";
import type { Site } from ".prisma/client";
import { WithImageSite } from "@/types";
import { revalidate } from "../revalidate";

/**
 * Get Site
 *
 * Fetches & returns either a single or all sites available depending on
 * whether a `subdomain` query parameter is provided. If not all sites are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getSite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<
  Array<WithImageSite> | (WithImageSite | null)
>> {
  const { subdomain } = req.query;

  if (Array.isArray(subdomain))
    return res
      .status(400)
      .end("Bad request. subdomain parameter cannot be an array.");

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID");

  try {
    if (subdomain) {
      const settings = await prisma.site.findFirst({
        where: {
          subdomain: subdomain,
          user: {
            id: session.user.id,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          font: true,
          subdomain: true,
          customDomain: true,
          userId: true,
          themeId: true,
          image: true,
          lang: true,
        },
      });

      return res.status(200).json(settings);
    }

    const sites = await prisma.site.findMany({
      where: {
        user: {
          id: session.user.id,
        },
      },
      include: {
        image: true,
      },
      orderBy: {
        customDomain: "asc",
      },
    });

    return res.status(200).json(sites);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Site
 *
 * Creates a new site from a set of provided query parameters.
 * These include:
 *  - name
 *  - subdomain
 *  - userId
 *
 * Once created, the sites new `siteId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createSite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<{
  siteId: string;
}>> {
  const { name, subdomain, userId } = req.body;

  if (!session.user.id)
    return res.status(500).end("Server failed to get session user ID");

  const sub = subdomain.replace(/[^a-zA-Z0-9/-]+/g, "");

  try {
    const response = await prisma.site.create({
      data: {
        name: name,
        subdomain: sub.length > 0 ? sub : cuid(),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    if (fs.existsSync(path.join("public", "rewrites", "index.json"))) {
      const rewrites = JSON.parse(
        fs.readFileSync(path.join("public", "rewrites", "index.json"), "utf-8")
      );

      const obj = {
        subdomain: subdomain,
        customDomain: null,
        theme: "classic",
      };
      rewrites.push(obj);

      fs.writeFileSync(
        path.join("public", "rewrites", "index.json"),
        JSON.stringify(rewrites)
      );
    }

    return res.status(201).json({
      siteId: response.id,
      subdomain: response.subdomain,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Site
 *
 * Deletes a site from the database using a provided `siteId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deleteSite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  const { subdomain } = req.query;

  if (!subdomain || typeof subdomain !== "string") {
    return res.status(400).json({ error: "Missing or misconfigured site ID" });
  }

  if (!session?.user.id) return res.status(401).end("Unauthorized");

  const site = await prisma.site.findFirst({
    where: {
      subdomain: subdomain,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!site) return res.status(404).end("Site not found");

  if (Array.isArray(subdomain))
    return res
      .status(400)
      .end("Bad request. siteId parameter cannot be an array.");

  try {
    await prisma.$transaction([
      prisma.post.deleteMany({
        where: {
          site: {
            subdomain: subdomain,
          },
        },
      }),
      prisma.site.delete({
        where: {
          subdomain: subdomain,
        },
      }),
    ]);

    if (fs.existsSync(path.join("public", "rewrites", "index.json"))) {
      const rewrites = JSON.parse(
        fs.readFileSync(path.join("public", "rewrites", "index.json"), "utf-8")
      );
      const idx = rewrites.indexOf(
        (rewrite: any) => rewrite.subdomain === subdomain
      );

      if (idx) {
        rewrites.splice(idx, 1);
      }

      fs.writeFileSync(
        path.join("public", "rewrites", "index.json"),
        JSON.stringify(rewrites)
      );
    }

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update site
 *
 * Updates a site & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - currentSubdomain
 *  - name
 *  - image
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateSite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<Site>> {
  const { subdomain, currentSubdomain, name, font, image, themeId } = req.body;

  if (!session?.user.id) return res.status(401).end("Unauthorized");

  if (!subdomain || typeof subdomain !== "string") {
    return res.status(400).json({ error: "Missing or misconfigured site ID" });
  }

  const site = await prisma.site.findFirst({
    where: {
      subdomain,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!site) return res.status(404).end("Site not found");

  const sub = req.body.subdomain.replace(/[^a-zA-Z0-9/-]+/g, "");
  const subdomainName = sub.length > 0 ? sub : currentSubdomain;

  try {
    const data: any = {
      name,
      font,
      subdomain: subdomainName,
      themeId,
    };

    if (image) {
      const imageRes = await prisma.image.create({
        data: {
          src: image.src,
          alt: image.alt,
          user: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });

      data["imageId"] = imageRes.id;
    }

    const response = await prisma.site.update({
      where: {
        subdomain: subdomain,
      },
      data,
    });

    await revalidate(site, undefined, undefined, undefined);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
