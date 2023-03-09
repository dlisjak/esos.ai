import type { Post } from "@prisma/client";

export interface MdxCardData extends Pick<Post, "description" | "image"> {
  name: string | null;
  url: string | null;
}
