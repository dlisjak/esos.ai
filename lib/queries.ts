import { WithImageSite } from "@/types";
import { WithAllCategory, WithImageCategory } from "@/types/category";
import { FeaturedPost, WithSitePost } from "@/types/post";
import {
  CategoryTranslation,
  Image,
  Post,
  PostTranslation,
  Prompt,
} from "@prisma/client";
import useSWR from "swr";
import { Language } from "./api/translate";

import fetcher from "./fetcher";

export const useSites = () => {
  const {
    data: sites,
    error,
    mutate,
  } = useSWR<WithImageSite[]>(`/api/site`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
  });

  return {
    sites,
    isLoading: !error && !sites,
    isError: error,
    mutateSites: mutate,
  };
};

export const useSite = (subdomain: any) => {
  const {
    data: site,
    error,
    mutate,
  } = useSWR<WithImageSite>(`/api/site?subdomain=${subdomain}`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
  });

  return {
    site,
    isLoading: !error && !site,
    isError: error,
    mutateSite: mutate,
  };
};

export const useDomainCheck = (domain: any) => {
  const {
    data: valid,
    error,
    mutate,
    isValidating,
  } = useSWR<any>(`/api/domain/check?domain=${domain}`, fetcher, {
    revalidateOnMount: true,
    refreshInterval: 5000,
  });

  return {
    valid,
    isLoading: !error && !valid,
    isError: error,
    isValidating: isValidating,
    mutateDomainCheck: mutate,
  };
};

export const usePost = (postId: any) => {
  const {
    data: post,
    error,
    mutate,
  } = useSWR<WithSitePost>(`/api/post?postId=${postId}`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
  });

  return {
    post,
    isLoading: !error && !post,
    isError: error,
    mutatePost: mutate,
  };
};

export const usePostTranslations = (postId: any) => {
  const {
    data: translations,
    error,
    mutate,
  } = useSWR<PostTranslation[]>(
    `/api/post/translate?postId=${postId}`,
    fetcher,
    {
      dedupingInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    translations,
    isLoading: !error && !translations,
    isError: error,
    mutateTranslations: mutate,
  };
};

export const usePosts = (subdomain: any, published: any) => {
  const {
    data: posts,
    error,
    mutate,
  } = useSWR<WithSitePost[]>(
    `/api/post?subdomain=${subdomain}&published=${published}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    posts,
    isLoading: !error && !posts,
    isError: error,
    mutateSubdomainPosts: mutate,
  };
};

export const useFeaturedPosts = (subdomain: any) => {
  const {
    data: posts,
    error,
    mutate,
  } = useSWR<FeaturedPost[]>(
    `/api/post/feature?subdomain=${subdomain}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    featuredPosts: posts,
    isLoading: !error && !posts,
    isError: error,
    mutateFeaturedPosts: mutate,
  };
};

export const useLatestPosts = (subdomain: any, limit: any) => {
  const {
    data: posts,
    error,
    mutate,
  } = useSWR<Post[]>(
    `/api/post/latest?subdomain=${subdomain}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    latestPosts: posts,
    isLoading: !error && !posts,
    isError: error,
    mutateLatestPosts: mutate,
  };
};

export const useCategories = (subdomain: any) => {
  const {
    data: categories,
    error,
    mutate,
  } = useSWR<WithImageCategory[]>(
    `/api/category?subdomain=${subdomain}`,
    fetcher,
    {
      dedupingInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    categories,
    isLoading: !error && !categories,
    isError: error,
    mutateCategories: mutate,
  };
};

export const useCategory = (categoryId: any) => {
  const {
    data: category,
    error,
    mutate,
  } = useSWR<WithAllCategory>(
    `/api/category?categoryId=${categoryId}`,
    fetcher,
    {
      dedupingInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    category,
    isLoading: !error && !category,
    isError: error,
    mutateCategory: mutate,
  };
};

export const useCategoryTranslations = (categoryId: any) => {
  const {
    data: translations,
    error,
    mutate,
  } = useSWR<CategoryTranslation[]>(
    `/api/category/translate?categoryId=${categoryId}`,
    fetcher,
    {
      dedupingInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    translations,
    isLoading: !error && !translations,
    isError: error,
    mutateTranslations: mutate,
  };
};

export const usePrompts = () => {
  const {
    data: prompts,
    error,
    mutate,
  } = useSWR<Prompt[]>(`/api/prompt`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
  });

  return {
    prompts,
    isLoading: !error && !prompts,
    isError: error,
    mutatePrompts: mutate,
  };
};

export const usePrompt = (promptId: any) => {
  const {
    data: prompt,
    error,
    mutate,
  } = useSWR<any>(`/api/prompt?promptId=${promptId}`, fetcher, {
    dedupingInterval: 1000,
    revalidateOnFocus: false,
  });

  return {
    prompt,
    isLoading: !error && !prompt,
    isError: error,
    mutatePrompt: mutate,
  };
};

export const useUser = () => {
  const {
    data: user,
    error,
    mutate,
  } = useSWR<any>(`/api/user`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    user: user,
    isLoading: !error && !user,
    isError: error,
    mutateCredits: mutate,
  };
};

export const useCredits = () => {
  const {
    data: user,
    error,
    mutate,
  } = useSWR<any>(`/api/user`, fetcher, {
    revalidateOnFocus: true,
  });

  return {
    credits: user?.credits,
    isLoading: !error && !user,
    isError: error,
    mutateCredits: mutate,
  };
};

export const useThemes = () => {
  const {
    data: themes,
    error,
    mutate,
  } = useSWR<any>(`/api/theme`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    themes,
    isLoading: !error && !themes,
    isError: error,
    mutateCredits: mutate,
  };
};

export const useSupportedLanguages = () => {
  const { data: languages, error } = useSWR<Language[]>(
    `/api/translate/languages`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    languages,
    isLoading: !error && !languages,
    isError: error,
  };
};

export const useImages = () => {
  const { data: images, error } = useSWR<Image[]>(`/api/images`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    images,
    isLoading: !error && !images,
    isError: error,
  };
};
