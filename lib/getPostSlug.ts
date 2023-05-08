export const getPostSlug = (post: any, category: any): any => {
  const slugs = [];

  while (category) {
    slugs.unshift(category.slug);
    category = category.parent;
  }

  slugs.push(post.slug);

  return slugs.join("/");
};

export const getCategorySlug = (category: any): any => {
  const slugs = [];

  while (category) {
    slugs.unshift(category.slug);
    category = category.parent;
  }

  return slugs.join("/");
};
