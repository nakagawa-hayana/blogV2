export interface Env {
	MY_BUCKET: R2Bucket;
	PUBLIC_IMAGE_BASE_URL: string;
}

interface OptimizeRequest {
	url: string;
	blockId: string;
}

interface OptimizeResponse {
	success: boolean;
	newUrl?: string;
	error?: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		try {
			const { url, blockId }: OptimizeRequest = await request.json();

			if (!url || !blockId) {
				return Response.json({ success: false, error: 'Missing url or blockId' }, { status: 400 });
			}

			const result = await optimizeAndUpload(env, url, blockId);
			return Response.json(result);
		} catch (e: any) {
			console.error('Image optimization error:', e);
			return Response.json({ success: false, error: e.message }, { status: 500 });
		}
	},
};

async function optimizeAndUpload(env: Env, url: string, blockId: string): Promise<OptimizeResponse> {
	// wsrv.nl を使ってリサイズ+WebP変換
	// 画像を最大幅2000px、品質80でWebPに変換
	// const encodedUrl = encodeURIComponent(url);
	// const wsrvUrl = `https://wsrv.nl/?url=${encodedUrl}&w=2000&output=webp&q=80`;

	// console.log(`Fetching optimized image via wsrv.nl: ${blockId}`);

	// const imageRes = await fetch(wsrvUrl);
	// if (!imageRes.ok) {
	return await uploadOriginal(env, url, blockId);
	// }

	// const imageBuffer = await imageRes.arrayBuffer();
	// console.log(`Optimized image size: ${blockId} (${imageBuffer.byteLength} bytes)`);

	const filename = `${blockId}.webp`;
	// await env.MY_BUCKET.put(filename, imageBuffer, {
	// 	httpMetadata: { contentType: 'image/webp' },
	// });

	// return {
	// 	success: true,
	// 	newUrl: `${env.PUBLIC_IMAGE_BASE_URL}/${filename}`,
	// };
}

async function uploadOriginal(env: Env, url: string, blockId: string): Promise<OptimizeResponse> {
	const imageRes = await fetch(url);
	if (!imageRes.ok) {
		throw new Error('Failed to fetch image from Notion');
	}

	const contentType = imageRes.headers.get('content-type') || 'image/png';
	const imageBuffer = await imageRes.arrayBuffer();
	const ext = getExtensionFromMime(contentType);

	const filename = `${blockId}.${ext}`;
	await env.MY_BUCKET.put(filename, imageBuffer, {
		httpMetadata: { contentType },
	});

	return {
		success: true,
		newUrl: `${env.PUBLIC_IMAGE_BASE_URL}/${filename}`,
	};
}

function getExtensionFromMime(mime: string): string {
	switch (mime) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/png':
			return 'png';
		case 'image/gif':
			return 'gif';
		case 'image/webp':
			return 'webp';
		default:
			return 'png';
	}
}
