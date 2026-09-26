CREATE INDEX "links_userId_createdAt_id_idx" ON "links"("userId", "createdAt", "id");
DROP INDEX "links_userId_idx";
