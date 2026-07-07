# Backend HTTP API

Cloudflare Workers (Rust, `worker` crate) + D1 で構築されたブログ用バックエンドの公開インターフェース。

- 実装: `backend/src/lib.rs`
- DB スキーマ: `backend/sql/scheme.sql`
- デプロイ設定: `backend/wrangler.toml` (Binding: `DB`, DB 名: `blog`)

Base URL は環境ごとに異なる。ローカルでは `http://localhost:8787`。

## エンドポイント一覧

| # | Method | Path                          | Auth   | 用途 |
|---|--------|-------------------------------|--------|------|
| 1 | GET    | `/articles/:url_suffix`       | none   | 単一記事取得 |
| 2 | GET    | `/articles?page=N`            | none   | 一覧 (20 件 / ページ) |
| 3 | GET    | `/articles/all`               | none   | 全件取得 (クライアント側フィルタ用) |
| 4 | POST   | `/articles`                   | Bearer | 作成 / 更新 (url_suffix 一致で UPSERT) |
| 5 | DELETE | `/articles/:url_suffix`       | Bearer | 削除 |

Bearer 認証は環境変数 `TOKEN` と一致する値を `Authorization: Bearer <TOKEN>` で送る。

## 型

日時はいずれも `YYYY-MM-DD HH:MM:SS` (UTC, `NaiveDateTime`) を JSON 文字列としてやり取りする。

```ts
interface Article {
  id: number;
  title: string;
  content: string;
  url_suffix: string;
  tags: string | null;       // カンマ区切り。例: "rust,backend"
  created_at: string;        // "YYYY-MM-DD HH:MM:SS"
  updated_at: string;        // "YYYY-MM-DD HH:MM:SS"
}

interface ArticleSummary {
  id: number;
  title: string;
  url_suffix: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}
```

## 1. GET `/articles/:url_suffix`

指定した `url_suffix` に一致する記事を 1 件返す。

- Path param: `url_suffix` (string, 記事の一意識別子)
- Response 200: `Article`
- Response 404: `Article not found`
- 実装: `get_article_by_url_suffix` (`backend/src/lib.rs:49`)

## 2. GET `/articles?page=N`

新しい順 (`updated_at DESC`) に 20 件ずつ返す。

- Query param: `page` (number, デフォルト 1、1 未満は 1 に補正)
- Response 200:

  ```ts
  interface ArticleListResponse {
    articles: ArticleSummary[];
    page: number;
    per_page: 20;
    total_count: number;
    total_pages: number;
  }
  ```

- 実装: `get_articles_list` (`backend/src/lib.rs:87`)

## 3. GET `/articles/all`

全ての記事を `Article[]` として返す (フルコンテンツ込み)。

- Response 200: `Article[]`
- 実装: `get_all_content` (`backend/src/lib.rs:75`)

利用側で 24 時間程度キャッシュする前提。

## 4. POST `/articles`

`url_suffix` が既に存在すれば更新、なければ新規作成する UPSERT。

- Headers: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- Request body:

  ```ts
  interface SaveArticleRequest {
    title: string;
    content: string;
    url_suffix: string;
    tags: string[];                    // 配列で受ける。DB には ",".join(tags) で格納される。
    created_at?: string;               // "YYYY-MM-DD HH:MM:SS"
    updated_at?: string;               // "YYYY-MM-DD HH:MM:SS"
  }
  ```

- Response 200: 保存後の `Article`
- Response 401: `Unauthorized`
- Response 500: 保存失敗時
- 実装: `save_article` (`backend/src/lib.rs:152`)

## 5. DELETE `/articles/:url_suffix`

指定 `url_suffix` の記事を削除する。

- Path param: `url_suffix`
- Headers: `Authorization: Bearer <TOKEN>`
- Response 200: `Article deleted successfully` (text/plain)
- Response 401: `Unauthorized`
- 実装: `delete_article` (`backend/src/lib.rs:273`)

## DB スキーマ

```sql
CREATE TABLE IF NOT EXISTS Articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    url_suffix TEXT NOT NULL UNIQUE,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

`tags` はカンマ区切り文字列として保存される。正規化された `Tags` / `ArticleTags` テーブルは存在しない。
