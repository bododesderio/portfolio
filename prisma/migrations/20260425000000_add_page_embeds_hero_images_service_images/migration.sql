-- CreateTable: page_embeds
CREATE TABLE "page_embeds" (
    "id"           TEXT NOT NULL,
    "page"         TEXT NOT NULL,
    "section"      TEXT NOT NULL,
    "sort_order"   INTEGER NOT NULL DEFAULT 0,
    "platform"     TEXT NOT NULL,
    "post_id"      TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "caption"      TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_embeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_embeds_page_section_sort_order_idx" ON "page_embeds"("page", "section", "sort_order");

-- CreateTable: hero_images
CREATE TABLE "hero_images" (
    "id"         TEXT NOT NULL,
    "media_id"   TEXT NOT NULL,
    "order"      INTEGER NOT NULL DEFAULT 0,
    "active"     BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hero_images" ADD CONSTRAINT "hero_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: services - add image fields
ALTER TABLE "services" ADD COLUMN "image_url" TEXT;
ALTER TABLE "services" ADD COLUMN "image_alt" TEXT;
