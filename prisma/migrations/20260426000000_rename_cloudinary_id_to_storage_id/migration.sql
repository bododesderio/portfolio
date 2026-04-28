-- Rename cloudinary_id → storage_id on the media table
ALTER TABLE "media" RENAME COLUMN "cloudinary_id" TO "storage_id";
