const withMDX = require('@next/mdx')()
const removeImports = require('next-remove-imports')();


module.exports = withMDX(removeImports({
  images: {
    domains: [
      "esosai.s3.eu-central-1.amazonaws.com",
      "avatars.githubusercontent.com",
    ],
  },
  reactStrictMode: true,
  swcMinify: false, // Required to fix: https://nextjs.org/docs/messages/failed-loading-swc
  experimental: {
    appDir: true,
    mdxRs: true,
  },
}));
