const withMDX = require('@next/mdx')()

module.exports = withMDX({
  images: {
    domains: [
      "esosai.s3.eu-central-1.amazonaws.com",
      "res.cloudinary.com",
      "abs.twimg.com",
      "pbs.twimg.com",
      "avatars.githubusercontent.com",
    ],
  },
  reactStrictMode: true,
  swcMinify: false, // Required to fix: https://nextjs.org/docs/messages/failed-loading-swc
  experimental: {
    appDir: true,
    mdxRs: true,
  },
});
