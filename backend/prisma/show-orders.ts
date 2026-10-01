import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
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