import {
  Category,
  Image,
  Post,
  PostLink,
  PostTranslation,
  Site,
} from "@prisma/client";

export interface WithImagePost extends Post {
  image: Image | null;
}

export interface FeaturedPost extends Post {
  image: Image | null;
  category: Category;
}

export interface WithSitePost extends Post {
  site: Site;
  category: Category;
  image: Image | null;
  links: PostLink[] | null;
  translations: PostTranslation[];
}

export interface GetAllPosts {
  posts: WithImagePost[];
}
