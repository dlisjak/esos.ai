import tinify from 'tinify';

tinify.key = process.env.TINYPNG_API_KEY || '';

export default tinify;
