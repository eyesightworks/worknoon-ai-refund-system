import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      orderNumber: 'asc',
    },
  });

  console.log(
    JSON.stringify(
      orders.map((o) => ({
        customerId: o.customerId,
        customer: o.customer.name,
        orderId: o.id,
        orderNumber: o.orderNumber,
        item: o.itemName,
        amount: o.totalAmount,
        finalSale: o.finalSale,
        damaged: o.damaged,
        incorrectItem: o.incorrectItem,
      })),
      null,
      2,
    ),
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });