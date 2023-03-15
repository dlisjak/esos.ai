import { Category, Image } from "@prisma/client";
import { WithImagePost } from "./post";

export interface WithImageCategory extends Category {
  image: Image | null;
}

export interface WithAllCategory extends WithImageCategory {
  parent: Category[];
  children: Category[];
  posts: WithImagePost[];
}
