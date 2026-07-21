-- Baseline sync migration.
-- Reconciles migration history with prisma/schema.prisma after a period of
-- `prisma db push` usage, which applied changes without recording history.
--
-- Adds 4 missing tables (projects, project_images, email_logs, email_events)
-- and 5 drifted ALTERs on existing tables.
--
-- EXISTING DEPLOYMENTS: these objects are already present. Do NOT run this.
-- Mark it applied instead:  npx prisma migrate resolve --applied 20260720000000_baseline_sync_drifted_models

-- DropForeignKey
ALTER TABLE "gallery_items" DROP CONSTRAINT "gallery_items_media_id_fkey";

-- DropForeignKey
ALTER TABLE "hero_images" DROP CONSTRAINT "hero_images_media_id_fkey";

-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "newsletter_campaigns" ADD COLUMN     "bounce_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "click_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "delivered_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "open_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
-- Added WITH a default so the backfill succeeds on tables that already hold rows,
-- then dropped so the column matches schema.prisma (@updatedAt is app-managed).
ALTER TABLE "services" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "services" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "subscribers" ALTER COLUMN "confirmed" SET DEFAULT false;

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "featured_image_url" TEXT,
    "featured_image_alt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "category" TEXT,
    "tech_stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "live_url" TEXT,
    "github_url" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "ongoing" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "postal_msg_id" TEXT,
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" TEXT NOT NULL,
    "email_log_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "url" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_visible_order_idx" ON "projects"("visible", "order");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "project_images_project_id_order_idx" ON "project_images"("project_id", "order");

-- CreateIndex
CREATE INDEX "email_logs_campaign_id_idx" ON "email_logs"("campaign_id");

-- CreateIndex
CREATE INDEX "email_logs_to_idx" ON "email_logs"("to");

-- CreateIndex
CREATE INDEX "email_logs_sent_at_idx" ON "email_logs"("sent_at");

-- CreateIndex
CREATE INDEX "email_logs_type_sent_at_idx" ON "email_logs"("type", "sent_at");

-- CreateIndex
CREATE INDEX "email_events_email_log_id_event_idx" ON "email_events"("email_log_id", "event");

-- CreateIndex
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");

-- CreateIndex
CREATE INDEX "clients_visible_order_idx" ON "clients"("visible", "order");

-- CreateIndex
CREATE INDEX "media_uploaded_at_idx" ON "media"("uploaded_at");

-- CreateIndex
CREATE INDEX "messages_received_at_idx" ON "messages"("received_at");

-- CreateIndex
CREATE INDEX "messages_email_idx" ON "messages"("email");

-- CreateIndex
CREATE INDEX "messages_read_archived_idx" ON "messages"("read", "archived");

-- CreateIndex
CREATE INDEX "press_items_visible_order_idx" ON "press_items"("visible", "order");

-- CreateIndex
CREATE INDEX "services_visible_order_idx" ON "services"("visible", "order");

-- CreateIndex
CREATE INDEX "site_content_page_section_idx" ON "site_content"("page", "section");

-- CreateIndex
CREATE INDEX "subscribers_confirmed_subscribed_at_idx" ON "subscribers"("confirmed", "subscribed_at");

-- CreateIndex
CREATE INDEX "testimonials_visible_order_idx" ON "testimonials"("visible", "order");

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_images" ADD CONSTRAINT "hero_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_email_log_id_fkey" FOREIGN KEY ("email_log_id") REFERENCES "email_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
