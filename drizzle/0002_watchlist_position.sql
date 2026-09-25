DROP INDEX "watchlist_user_idx";--> statement-breakpoint
ALTER TABLE "watchlist_item" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "watchlist_user_position_idx" ON "watchlist_item" USING btree ("user_id","position");--> statement-breakpoint
UPDATE "watchlist_item" AS w SET "position" = r.rn FROM (SELECT "id", (row_number() OVER (PARTITION BY "user_id" ORDER BY "added_at", "id") - 1)::integer AS rn FROM "watchlist_item") AS r WHERE w."id" = r."id";
