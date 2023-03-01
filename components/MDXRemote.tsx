'use client';

import { MDXRemote } from 'next-mdx-remote/rsc';

const MDXRemoteWrapper = ({ source }) => {
	/* @ts-expect-error Server Component */
	return <MDXRemote source={source} />;
};

export default MDXRemoteWrapper;
