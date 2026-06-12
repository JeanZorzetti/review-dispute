-- CreateTable
CREATE TABLE "checker_runs" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "rating" INTEGER,
    "violationType" TEXT,
    "caseStrength" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "eligible" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checker_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checker_leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "runId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checker_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checker_runs_ipHash_createdAt_idx" ON "checker_runs"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "checker_leads_runId_key" ON "checker_leads"("runId");

-- CreateIndex
CREATE INDEX "checker_leads_email_idx" ON "checker_leads"("email");

-- AddForeignKey
ALTER TABLE "checker_leads" ADD CONSTRAINT "checker_leads_runId_fkey" FOREIGN KEY ("runId") REFERENCES "checker_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
