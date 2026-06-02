import { prisma } from '../../lib/prisma'

export async function resetDb() {
  await prisma.charge.deleteMany()
  await prisma.outcome.deleteMany()
  await prisma.classificationLog.deleteMany()
  await prisma.dispute.deleteMany()
  await prisma.review.deleteMany()
  await prisma.client.deleteMany()
}
