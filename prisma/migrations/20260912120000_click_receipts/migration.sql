CREATE TABLE "click_receipts" (
  "id" TEXT PRIMARY KEY,
  "linkId" TEXT NOT NULL REFERENCES "links"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "click_receipts_linkId_idx" ON "click_receipts"("linkId");
CREATE INDEX "links_userId_createdAt_id_idx" ON "links"("userId", "createdAt", "id");
DROP INDEX "links_userId_idx";
