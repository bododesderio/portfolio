-- Indexes for filter/sort paths that were doing sequential scans:
--   gallery_items  — homepage featured gallery, category filter
--   hero_images    — carousel loads active images ordered
--   blog_posts     — category archive pages
--   newsletter_campaigns — admin draft/sent filtering and reporting
--
-- Purely additive. Unlike the baseline sync migration, this one SHOULD
-- run on existing deployments — these indexes do not exist anywhere yet.

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE INDEX "gallery_items_featured_order_idx" ON "gallery_items"("featured", "order");

-- CreateIndex
CREATE INDEX "gallery_items_category_idx" ON "gallery_items"("category");

-- CreateIndex
CREATE INDEX "hero_images_active_order_idx" ON "hero_images"("active", "order");

-- CreateIndex
CREATE INDEX "newsletter_campaigns_status_sent_at_idx" ON "newsletter_campaigns"("status", "sent_at");

