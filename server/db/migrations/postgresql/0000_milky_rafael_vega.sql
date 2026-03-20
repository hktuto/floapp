CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"identifier" text NOT NULL,
	"hash" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"record_id" uuid,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"blob_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"requester_id" uuid NOT NULL,
	"addressee_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurement_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"recorded_at" date NOT NULL,
	"weight_kg" numeric(5, 2),
	"body_fat_pct" numeric(4, 2),
	"muscle_kg" numeric(5, 2),
	"water_pct" numeric(4, 2),
	"bone_kg" numeric(4, 2),
	"visceral_fat" integer,
	"chest_cm" numeric(5, 2),
	"waist_cm" numeric(5, 2),
	"hips_cm" numeric(5, 2),
	"thigh_cm" numeric(5, 2),
	"arm_cm" numeric(5, 2),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "targets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_value" numeric(6, 2) NOT NULL,
	"target_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"achieved_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"gender" text,
	"height_cm" numeric(5, 2),
	"birth_date" date,
	"description" text,
	"avatar_url" text,
	"role" text DEFAULT 'user',
	"latest_record" jsonb DEFAULT '{}'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_record_id_measurement_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."measurement_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_accounts_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_accounts_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurement_records" ADD CONSTRAINT "measurement_records_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "type_identifier_idx" ON "accounts" USING btree ("type","identifier");--> statement-breakpoint
CREATE INDEX "attachments_account_idx" ON "attachments" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "attachments_record_idx" ON "attachments" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "friendships_requester_idx" ON "friendships" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "friendships_addressee_idx" ON "friendships" USING btree ("addressee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_friendship_idx" ON "friendships" USING btree ("requester_id","addressee_id");--> statement-breakpoint
CREATE INDEX "measurements_account_recorded_idx" ON "measurement_records" USING btree ("account_id","recorded_at");--> statement-breakpoint
CREATE INDEX "targets_account_status_idx" ON "targets" USING btree ("account_id","status");