const removeImports = require('next-remove-imports')();
const { i18n } = require('./next-i18next.config')

module.exports = removeImports({
  images: {
    domains: [
      "esosai.s3.eu-central-1.amazonaws.com",
      "avatars.githubusercontent.com",
    ],
  },
  reactStrictMode: true,
  swcMinify: false, // Required to fix: https://nextjs.org/docs/messages/failed-loading-swc
  i18n,
});
