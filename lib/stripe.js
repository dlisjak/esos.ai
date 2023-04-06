const stripe = require("stripe")("sk_test_51MtqnZLbJKr1G0zjyZlXIqdtIvDf57YyWXRrW7DqRUnF9gubAN05cYOu8Yk0L7ZR9ixDAZdPKKBhVCAlpjeGu8iw00T4FoNGs0");

const stripeApi = global.stripe || stripe;

if (process.env.NODE_ENV === "development") global.stripeApi = stripeApi;

export default stripeApi;
