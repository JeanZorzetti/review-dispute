-- AlterTable
ALTER TABLE "charges" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'issued',
ADD COLUMN     "stripeInvoiceId" TEXT;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "billingMethod" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT;
