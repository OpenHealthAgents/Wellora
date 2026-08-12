-- CreateTable
CREATE TABLE "PlanPrice" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- Backfill current JSON prices into per-country rows.
INSERT INTO "PlanPrice" ("id", "planId", "country", "currency", "amount", "updatedAt")
SELECT "id" || '_US', "id", 'US', 'USD', ("prices"->>'USD')::DOUBLE PRECISION, CURRENT_TIMESTAMP
FROM "Plan"
WHERE "prices" ? 'USD';

INSERT INTO "PlanPrice" ("id", "planId", "country", "currency", "amount", "updatedAt")
SELECT "id" || '_GB', "id", 'GB', 'GBP', ("prices"->>'GBP')::DOUBLE PRECISION, CURRENT_TIMESTAMP
FROM "Plan"
WHERE "prices" ? 'GBP';

INSERT INTO "PlanPrice" ("id", "planId", "country", "currency", "amount", "updatedAt")
SELECT "id" || '_DE', "id", 'DE', 'EUR', ("prices"->>'EUR')::DOUBLE PRECISION, CURRENT_TIMESTAMP
FROM "Plan"
WHERE "prices" ? 'EUR';

INSERT INTO "PlanPrice" ("id", "planId", "country", "currency", "amount", "updatedAt")
SELECT "id" || '_FR', "id", 'FR', 'EUR', ("prices"->>'EUR')::DOUBLE PRECISION, CURRENT_TIMESTAMP
FROM "Plan"
WHERE "prices" ? 'EUR';

INSERT INTO "PlanPrice" ("id", "planId", "country", "currency", "amount", "updatedAt")
SELECT "id" || '_IN', "id", 'IN', 'INR', ("prices"->>'INR')::DOUBLE PRECISION, CURRENT_TIMESTAMP
FROM "Plan"
WHERE "prices" ? 'INR';

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_country_key" ON "PlanPrice"("planId", "country");

-- CreateIndex
CREATE INDEX "PlanPrice_country_idx" ON "PlanPrice"("country");

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropColumn
ALTER TABLE "Plan" DROP COLUMN "prices";
