import { Category, CategoryTranslation, Image } from "@prisma/client";
import { WithImagePost } from "./post";

export interface WithImageCategory extends Category {
  image: Image | null;
}

export interface WithAllCategory extends WithImageCategory {
  parent: Category[];
  children: WithAllCategory[];
  posts: WithImagePost[];
  translations: CategoryTranslation[];
}
