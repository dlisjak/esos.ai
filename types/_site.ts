import type { Image, Post, Site, User } from "@prisma/client";

export interface WithImageSite extends Site {
  image: Image | null;
}
export interface _SiteData extends Site {
  user: User | null;
  font: "" | "font-lora" | "font-work";
  posts: Array<Post>;
}

export interface _SiteSlugData extends Post {
  site: _SiteSite | null;
}

interface _SiteSite extends Site {
  user: User | null;
}
