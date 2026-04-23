# Stock photo pack

Curated, attributed photos downloaded from [Unsplash](https://unsplash.com/) for use as defaults
throughout the admin (blog featured images, gallery, hero placeholders).

## How to populate

1. Sign up for a free Unsplash developer account: https://unsplash.com/developers.
2. Create an application and copy the **Access Key**.
3. Add it to your `.env` (never commit this file):

   ```bash
   echo 'UNSPLASH_ACCESS_KEY=your_key_here' >> .env
   ```

4. Run the fetch script from the repo root:

   ```bash
   UNSPLASH_ACCESS_KEY=your_key_here node scripts/fetch-stock-pack.mjs
   ```

   Queries and per-query counts live in [`scripts/stock-queries.json`](../../scripts/stock-queries.json).
   Edit them to change what gets downloaded.

5. The script is **idempotent** — existing images (identified by Unsplash photo `id`) are skipped.
   Rerun it to top up after editing the queries.

## What it writes

- `public/stock/<slug>-<id>.jpg` — one file per photo
- `public/stock/manifest.json` — index with metadata:

  ```json
  {
    "images": [
      {
        "id": "unique-id",
        "filename": "technology-xyz.jpg",
        "query": "technology",
        "photographer": "First Last",
        "photographer_url": "https://unsplash.com/@username",
        "source": "unsplash",
        "source_url": "https://unsplash.com/photos/...",
        "width": 6000,
        "height": 4000,
        "alt": "…"
      }
    ]
  }
  ```

## Licensing — always credit

Unsplash photos are free to use, but the [Unsplash License](https://unsplash.com/license) asks for
attribution when possible. The MediaPicker's Stock tab automatically passes `photographer` and
`photographer_url` through as `attribution` when you insert a stock image into a blog post — so
visible credit appears under the image on the published page.

## Git tracking

Binary images are **not** committed. `.gitignore` excludes `public/stock/*.{jpg,jpeg,png,webp}` but
preserves `manifest.json` and this `README.md`.

When you roll to a new machine or CI, rerun the fetch script to repopulate.
