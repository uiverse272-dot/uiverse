CREATE TABLE "pin" (
	"userId" text NOT NULL,
	"collectionId" text NOT NULL,
	"slug" text NOT NULL,
	"at" bigint NOT NULL,
	CONSTRAINT "pin_userId_collectionId_slug_pk" PRIMARY KEY("userId","collectionId","slug")
);
--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "save" ADD COLUMN "note" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pin" ADD CONSTRAINT "pin_userId_collectionId_collection_userId_id_fk" FOREIGN KEY ("userId","collectionId") REFERENCES "public"."collection"("userId","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin" ADD CONSTRAINT "pin_userId_slug_save_userId_slug_fk" FOREIGN KEY ("userId","slug") REFERENCES "public"."save"("userId","slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- hand-added: a save's one collection becomes its first pin, before 0002 drops the column
INSERT INTO "pin" ("userId", "collectionId", "slug", "at")
SELECT s."userId", s."collectionId", s."slug", s."at" FROM "save" s
JOIN "collection" c ON c."userId" = s."userId" AND c."id" = s."collectionId";
