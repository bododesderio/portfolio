-- Part 1: rename + add columns (nullable during backfill)
ALTER TABLE "blog_posts"
  RENAME COLUMN "featured_image" TO "featured_image_url";

ALTER TABLE "blog_posts"
  ADD COLUMN "featured_image_alt"          TEXT,
  ADD COLUMN "featured_image_attribution"  JSONB;

-- Part 2: backfill null featured_image_url + alt
UPDATE "blog_posts"
SET "featured_image_url" = COALESCE("featured_image_url", '/images/stock/blog-hero.svg'),
    "featured_image_alt" = COALESCE("featured_image_alt", "title");

-- Part 3: enforce NOT NULL
ALTER TABLE "blog_posts"
  ALTER COLUMN "featured_image_url" SET NOT NULL,
  ALTER COLUMN "featured_image_alt" SET NOT NULL;
