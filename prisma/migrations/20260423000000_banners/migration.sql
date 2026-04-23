-- CreateTable
CREATE TABLE "banners" (
    "id"                TEXT NOT NULL,
    "name"              TEXT NOT NULL,
    "kind"              TEXT NOT NULL,
    "placement"         TEXT NOT NULL DEFAULT 'bottom',
    "title"             TEXT,
    "body"              TEXT,
    "image_url"         TEXT,
    "cta_label"         TEXT,
    "cta_url"           TEXT,
    "cta_variant"       TEXT NOT NULL DEFAULT 'primary',
    "dismissable"       BOOLEAN NOT NULL DEFAULT true,
    "require_consent"   BOOLEAN NOT NULL DEFAULT false,
    "theme"             TEXT NOT NULL DEFAULT 'auto',

    "enabled"           BOOLEAN NOT NULL DEFAULT false,
    "priority"          INTEGER NOT NULL DEFAULT 0,
    "starts_at"         TIMESTAMP(3),
    "ends_at"           TIMESTAMP(3),
    "pages_include"     TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pages_exclude"     TEXT[] DEFAULT ARRAY[]::TEXT[],
    "devices"           TEXT[] DEFAULT ARRAY[]::TEXT[],

    "show_once"         BOOLEAN NOT NULL DEFAULT false,
    "cooldown_hours"    INTEGER NOT NULL DEFAULT 0,
    "delay_seconds"     INTEGER NOT NULL DEFAULT 0,
    "scroll_trigger"    INTEGER,
    "exit_intent"       BOOLEAN NOT NULL DEFAULT false,
    "newsletter_hook"   BOOLEAN NOT NULL DEFAULT false,

    "impression_count"  INTEGER NOT NULL DEFAULT 0,
    "click_count"       INTEGER NOT NULL DEFAULT 0,
    "dismiss_count"     INTEGER NOT NULL DEFAULT 0,
    "conversion_count"  INTEGER NOT NULL DEFAULT 0,

    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_enabled_priority_idx" ON "banners"("enabled", "priority");
