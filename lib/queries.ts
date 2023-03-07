import { useRouter } from 'next/router';
import useSWR from 'swr';

import fetcher from './fetcher';

import { Category, Post, Prompt, Site } from '@prisma/client';

interface CategoryWithPosts extends Category {
	posts: Post[];
}

export const useSites = () => {
	const router = useRouter();

	const {
		data: sites,
		error,
		mutate,
	} = useSWR<Site[]>(`/api/site`, fetcher, {
		dedupingInterval: 1000,
		onError: () => router.push('/'),
		revalidateOnFocus: false,
	});

	return {
		sites,
		isLoading: !error && !sites,
		isError: error,
		mutateSites: mutate,
	};
};

export const useSite = (subdomain) => {
	const router = useRouter();

	const {
		data: site,
		error,
		mutate,
	} = useSWR<Site>(`/api/site?subdomain=${subdomain}`, fetcher, {
		dedupingInterval: 1000,
		onError: () => router.push('/'),
		revalidateOnFocus: false,
	});

	return {
		site,
		isLoading: !error && !site,
		isError: error,
		mutateSite: mutate,
	};
};

export const useDomainCheck = (domain) => {
	const {
		data: valid,
		error,
		mutate,
		isValidating,
	} = useSWR<Site>(`/api/domain/check?domain=${domain}`, fetcher, {
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

export const usePost = (postId) => {
	const router = useRouter();

	const {
		data: post,
		error,
		mutate,
	} = useSWR<Post>(`/api/post?postId=${postId}`, fetcher, {
		dedupingInterval: 1000,
		onError: () => router.push('/'),
		revalidateOnFocus: false,
	});

	return {
		post,
		isLoading: !error && !post,
		isError: error,
		mutatePost: mutate,
	};
};

export const useSubdomainPosts = (subdomain, published) => {
	const router = useRouter();

	const {
		data: posts,
		error,
		mutate,
	} = useSWR<Array<Post>>(
		`/api/post?subdomain=${subdomain}&published=${published}`,
		fetcher,
		{
			onError: () => router.push('/'),
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

export const useCategories = () => {
	const router = useRouter();

	const {
		data: categories,
		error,
		mutate,
	} = useSWR<Category[]>(`/api/category`, fetcher, {
		dedupingInterval: 1000,
		onError: () => router.push('/'),
		revalidateOnFocus: false,
	});

	return {
		categories,
		isLoading: !error && !categories,
		isError: error,
		mutateCategories: mutate,
	};
};

export const useCategory = (categoryId) => {
	const router = useRouter();

	const {
		data: category,
		error,
		mutate,
	} = useSWR<CategoryWithPosts>(
		`/api/category?categoryId=${categoryId}`,
		fetcher,
		{
			dedupingInterval: 1000,
			onError: () => router.push('/'),
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

export const usePrompts = () => {
	const router = useRouter();

	const {
		data: prompts,
		error,
		mutate,
	} = useSWR<Prompt[]>(`/api/prompt`, fetcher, {
		dedupingInterval: 1000,
		onError: () => router.push('/'),
		revalidateOnFocus: false,
	});

	return {
		prompts,
		isLoading: !error && !prompts,
		isError: error,
		mutatePrompts: mutate,
	};
};

export const usePrompt = (promptId) => {
	const {
		data: prompt,
		error,
		mutate,
	} = useSWR<Prompt>(`/api/prompt?promptId=${promptId}`, fetcher, {
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
