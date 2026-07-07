import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

export interface Env {
	NOTION_API_KEY: string;
	RUST_BACKEND_URL: string;
	RUST: Service;
	IMAGE_OPTIMIZER: Service;
	ADRY_TOKEN: string;
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
			const payload: any = await request.json();
			const isPublish = payload?.data?.properties['公開']?.checkbox;
			const urlSuffixArray = payload?.data?.properties?.url_suffix?.rich_text;
			const urlSuffix = urlSuffixArray.map((obj: any) => obj?.plain_text).join('');

			if (!isPublish) {
				const path = `${env.RUST_BACKEND_URL}/articles`;
				console.log(`Sending to: [${path}]`);

				const rustResponse = await env.RUST.fetch(path, {
					method: 'DELETE',
					headers: { Authorization: 'Bearer ' + env.ADRY_TOKEN },
				});
				const body = await rustResponse.text();
				console.log(body);
				return new Response('Success: Sent to Rust backend', { status: 200 });
			} else {
				const pageId = payload?.data?.id;

				const notion = new Client({
					auth: env.NOTION_API_KEY,
					fetch: (url, init) => {
						return fetch(url, init);
					},
				});

				const tags = payload?.data?.properties['タグ']?.multi_select?.map((obj: any) => obj?.name);
				const title = payload?.data?.properties['タイトル']?.title?.map((obj: any) => obj?.plain_text).join('');

				if (!pageId) {
					return new Response("Error: Missing 'data.id' in payload", { status: 400 });
				}

				console.log(`Processing Page ID: ${pageId}`);

				const n2m = new NotionToMarkdown({ notionClient: notion });

				const mdBlocks = await n2m.pageToMarkdown(pageId);

				// 画像を順次処理（別Workerに委譲）
				for (let i = 0; i < mdBlocks.length; i++) {
					const block = mdBlocks[i];
					if (block.type === 'image') {
						const match = block.parent.match(/\!\[(.*?)\]\((.*?)\)/);

						if (match && match[2]) {
							const originalUrl = match[2];
							const blockId = block.blockId;

							const newUrl = await optimizeImage(env, originalUrl, blockId);

							if (newUrl) {
								block.parent = `![${match[1] || 'image'}](${newUrl})`;
								console.log(`Uploaded & Replaced: ${blockId}`);
							}
						}
					}
				}

				const mdString = n2m.toMarkdownString(mdBlocks);
				const rustPayload = {
					title: title,
					content: mdString.parent,
					url_suffix: urlSuffix,
					tags: tags,
				};
				const path = `${env.RUST_BACKEND_URL}/articles`;
				console.log(`Sending to: [${path}]`);

				const rustResponse = await env.RUST.fetch(path, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.ADRY_TOKEN },
					body: JSON.stringify(rustPayload),
				});
				const body = await rustResponse.text();
				console.log(body);

				return new Response('Success: Sent to Rust backend', { status: 200 });
			}
		} catch (e: any) {
			console.error(e);
			return new Response(`Server Error: ${e.message}`, { status: 500 });
		}
	},
};

async function optimizeImage(env: Env, url: string, blockId: string): Promise<string | null> {
	try {
		console.log(`Delegating image optimization: ${blockId}`);

		const response = await env.IMAGE_OPTIMIZER.fetch('https://image-optimizer.internal/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url, blockId }),
		});

		const result: OptimizeResponse = await response.json();

		if (result.success && result.newUrl) {
			return result.newUrl;
		} else {
			console.error(`Image optimization failed for ${blockId}:`, result.error);
			return null;
		}
	} catch (e) {
		console.error(`Failed to optimize image ${blockId}:`, e);
		return null;
	}
}
