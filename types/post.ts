import { Category, Image, Post, Site } from "@prisma/client";

export interface WithImagePost extends Post {
  image: Image | null;
}

export interface FeaturedPost extends Post {
  image: Image | null;
  categgory: Category;
}

export interface WithSitePost extends Post {
  site: Site;
  category: Category;
  image: Image | null;
}

export interface GetAllPosts {
  posts: WithImagePost[];
}
