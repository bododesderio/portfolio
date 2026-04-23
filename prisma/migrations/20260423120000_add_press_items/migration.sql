-- CreateTable
CREATE TABLE "press_items" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'article',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_url" TEXT,
    "image_url" TEXT,
    "image_alt" TEXT,
    "external_url" TEXT,
    "download_url" TEXT,
    "date" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "press_items_pkey" PRIMARY KEY ("id")
);
