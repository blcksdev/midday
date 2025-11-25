ALTER TABLE "inbox_accounts" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."inbox_account_providers";--> statement-breakpoint
CREATE TYPE "public"."inbox_account_providers" AS ENUM('gmail');--> statement-breakpoint
ALTER TABLE "inbox_accounts" ALTER COLUMN "provider" SET DATA TYPE "public"."inbox_account_providers" USING "provider"::"public"."inbox_account_providers";--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "fiscal_year_start_month" smallint;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "tax_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "taxRate";