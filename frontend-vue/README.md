# frontend-vue

Nuxt 3 版フロントエンド。旧 `frontend/` (Next.js) の刷新版。

## 開発

```bash
pnpm install
cp .env.example .env
# .env で BACKEND_URL / PUBLISH_URL を設定
pnpm dev
```

- Dev server: http://localhost:3000
- Backend (別プロセス): `cd ../backend && npx wrangler dev` (http://localhost:8787)

## ビルド

```bash
pnpm build       # ローカル (node-server preset)
NITRO_PRESET=cloudflare-pages pnpm build   # Cloudflare Pages 用
```

- node-server 出力: `.output/public` + `.output/server/index.mjs` (`node .output/server/index.mjs` で起動)
- cloudflare-pages 出力: `dist/` (静的アセット + `_worker.js` + `wasm/*`)。`npx wrangler pages dev dist` でエッジと同等の環境で起動可能。
