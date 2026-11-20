-- CreateTable
CREATE TABLE "inbound_emails" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "from_name" TEXT NOT NULL DEFAULT '',
    "reply_to" TEXT,
    "recipients" TEXT[],
    "subject" TEXT NOT NULL,
    "text_body" TEXT NOT NULL DEFAULT '',
    "html_body" TEXT NOT NULL DEFAULT '',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "spam_score" DOUBLE PRECISION,
    "forwarded_to" TEXT,
    "forwarded_at" TIMESTAMP(3),
    "forward_error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbound_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inbound_emails_message_id_key" ON "inbound_emails"("message_id");

-- CreateIndex
CREATE INDEX "inbound_emails_received_at_idx" ON "inbound_emails"("received_at");
