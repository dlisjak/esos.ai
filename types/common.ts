import type { Post, Site, Category } from '@prisma/client';
import type { PropsWithChildren } from 'react';

export type WithChildren<T = {}> = T & PropsWithChildren<{}>;

export type WithClassName<T = {}> = T & {
	className?: string;
};

export interface WithSitePost extends Post {
	site: Site | null;
}

export interface WithSiteCategory extends Category {
	site: Site | null;
}
