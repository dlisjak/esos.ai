import { APIRoute } from 'next-s3-upload';

export default APIRoute.configure({
	async key(req, filename) {
		const path = req.body.path;

		return `${path}/${filename}`;
	},
});
