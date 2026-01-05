CREATE TABLE "single_child1" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"age" integer NOT NULL,
	"nickname" text,
	"score" numeric NOT NULL,
	"verified" boolean,
	"type" text DEFAULT 'child1'
);
--> statement-breakpoint
CREATE TABLE "single_child10" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"nickname" text,
	"bio" text,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"height_cm" numeric NOT NULL,
	"weight_kg" numeric,
	"points" integer,
	"rating" numeric,
	"score" numeric NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"verified" boolean,
	"completed" boolean DEFAULT false NOT NULL,
	"subscribed" boolean,
	"flag1" boolean,
	"flag2" boolean,
	"flag3" boolean,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp,
	"registered_at" timestamp NOT NULL,
	"last_login" timestamp,
	"code" varchar(50) NOT NULL,
	"meta" text,
	"reference_id" varchar
);
--> statement-breakpoint
CREATE TABLE "single_child2" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"bio" text,
	"height_cm" numeric NOT NULL,
	"weight_kg" numeric,
	"registered_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "single_child3" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"active_flag" boolean NOT NULL,
	"points" integer
);
--> statement-breakpoint
CREATE TABLE "single_child4" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"meta" text,
	"rating" numeric,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "single_child5" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"active" boolean
);
--> statement-breakpoint
CREATE TABLE "single_child6" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"code" text NOT NULL,
	"value" numeric,
	"flag" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "single_child7" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"info" text,
	"level" integer NOT NULL,
	"valid" boolean
);
--> statement-breakpoint
CREATE TABLE "single_child8" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"data" text,
	"count" integer NOT NULL,
	"processed" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "single_child9" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"comment" text,
	"score" numeric NOT NULL,
	"active" boolean
);
--> statement-breakpoint
CREATE TABLE "single_history" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_type" text,
	"step_id" uuid NOT NULL,
	"relevance_start" timestamp NOT NULL,
	"relevance_end" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "steps_to_types" (
	"step_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	CONSTRAINT "steps_to_types_step_id_entity_type_pk" PRIMARY KEY("step_id","entity_type")
);
--> statement-breakpoint
CREATE INDEX "single_child1_id_index" ON "single_child1" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child10_id_index" ON "single_child10" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child2_id_index" ON "single_child2" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child3_id_index" ON "single_child3" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child4_id_index" ON "single_child4" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child5_id_index" ON "single_child5" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child6_id_index" ON "single_child6" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child7_id_index" ON "single_child7" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child8_id_index" ON "single_child8" USING btree ("id");--> statement-breakpoint
CREATE INDEX "single_child9_id_index" ON "single_child9" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_history_stepid" ON "single_history" USING btree ("step_id");--> statement-breakpoint
CREATE INDEX "single_history_step_id_entity_type_index" ON "single_history" USING btree ("step_id","entity_type");--> statement-breakpoint
CREATE INDEX "idx_history_type" ON "single_history" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_history_entityId" ON "single_history" USING btree ("step_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "steps_to_types_step_id_entity_type_index" ON "steps_to_types" USING btree ("step_id","entity_type");