import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding WorkNoon refund system...');

  // Clear existing data so the seed can safely be re-run.
  await prisma.auditLog.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  const customers = [
    {
      name: 'John Carter',
      email: 'john.carter@example.com',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
    },
    {
      name: 'Daniel Wilson',
      email: 'daniel.wilson@example.com',
    },
    {
      name: 'Jessica Moore',
      email: 'jessica.moore@example.com',
    },
    {
      name: 'Robert Taylor',
      email: 'robert.taylor@example.com',
    },
    {
      name: 'Olivia Anderson',
      email: 'olivia.anderson@example.com',
    },
    {
      name: 'William Thomas',
      email: 'william.thomas@example.com',
    },
    {
      name: 'Sophia Jackson',
      email: 'sophia.jackson@example.com',
    },
    {
      name: 'James White',
      email: 'james.white@example.com',
    },
    {
      name: 'Ava Harris',
      email: 'ava.harris@example.com',
    },
    {
      name: 'Benjamin Martin',
      email: 'benjamin.martin@example.com',
    },
    {
      name: 'Mia Thompson',
      email: 'mia.thompson@example.com',
    },
    {
      name: 'Alexander Garcia',
      email: 'alexander.garcia@example.com',
    },
  ];

  const createdCustomers = [];

  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: customer,
    });

    createdCustomers.push(created);
  }

  const now = new Date();

  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  };

  const orders = [
    // Eligible refund
    {
      customerId: createdCustomers[0].id,
      orderNumber: 'WN-10001',
      orderDate: daysAgo(5),
      totalAmount: 120,
      itemName: 'Wireless Keyboard',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Final sale - should be denied
    {
      customerId: createdCustomers[1].id,
      orderNumber: 'WN-10002',
      orderDate: daysAgo(4),
      totalAmount: 85,
      itemName: 'Clearance Headphones',
      finalSale: true,
      damaged: false,
      incorrectItem: false,
    },

    // Old order - should be denied
    {
      customerId: createdCustomers[2].id,
      orderNumber: 'WN-10003',
      orderDate: daysAgo(45),
      totalAmount: 150,
      itemName: 'Mechanical Keyboard',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Damaged item - eligible
    {
      customerId: createdCustomers[3].id,
      orderNumber: 'WN-10004',
      orderDate: daysAgo(7),
      totalAmount: 220,
      itemName: '27-inch Monitor',
      finalSale: false,
      damaged: true,
      incorrectItem: false,
    },

    // Incorrect item - eligible
    {
      customerId: createdCustomers[4].id,
      orderNumber: 'WN-10005',
      orderDate: daysAgo(6),
      totalAmount: 180,
      itemName: 'USB-C Docking Station',
      finalSale: false,
      damaged: false,
      incorrectItem: true,
    },

    // Over $500 - human review
    {
      customerId: createdCustomers[5].id,
      orderNumber: 'WN-10006',
      orderDate: daysAgo(3),
      totalAmount: 850,
      itemName: 'Professional Laptop',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Suspicious/conflicting case
    {
      customerId: createdCustomers[6].id,
      orderNumber: 'WN-10007',
      orderDate: daysAgo(2),
      totalAmount: 320,
      itemName: 'Smartphone',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Normal eligible refund
    {
      customerId: createdCustomers[7].id,
      orderNumber: 'WN-10008',
      orderDate: daysAgo(10),
      totalAmount: 75,
      itemName: 'Bluetooth Speaker',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Final sale
    {
      customerId: createdCustomers[8].id,
      orderNumber: 'WN-10009',
      orderDate: daysAgo(8),
      totalAmount: 60,
      itemName: 'Clearance Mouse',
      finalSale: true,
      damaged: false,
      incorrectItem: false,
    },

    // Damaged item
    {
      customerId: createdCustomers[9].id,
      orderNumber: 'WN-10010',
      orderDate: daysAgo(9),
      totalAmount: 310,
      itemName: 'Office Chair',
      finalSale: false,
      damaged: true,
      incorrectItem: false,
    },

    // Old order
    {
      customerId: createdCustomers[10].id,
      orderNumber: 'WN-10011',
      orderDate: daysAgo(60),
      totalAmount: 275,
      itemName: 'Tablet',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // High-value refund
    {
      customerId: createdCustomers[11].id,
      orderNumber: 'WN-10012',
      orderDate: daysAgo(5),
      totalAmount: 1250,
      itemName: 'MacBook Laptop',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Incorrect item
    {
      customerId: createdCustomers[12].id,
      orderNumber: 'WN-10013',
      orderDate: daysAgo(12),
      totalAmount: 195,
      itemName: 'Wireless Router',
      finalSale: false,
      damaged: false,
      incorrectItem: true,
    },

    // Normal eligible refund
    {
      customerId: createdCustomers[13].id,
      orderNumber: 'WN-10014',
      orderDate: daysAgo(4),
      totalAmount: 95,
      itemName: 'Webcam',
      finalSale: false,
      damaged: false,
      incorrectItem: false,
    },

    // Conflicting/suspicious case
    {
      customerId: createdCustomers[14].id,
      orderNumber: 'WN-10015',
      orderDate: daysAgo(1),
      totalAmount: 450,
      itemName: 'Gaming Console',
      finalSale: false,
      damaged: true,
      incorrectItem: true,
    },
  ];

  for (const order of orders) {
    await prisma.order.create({
      data: order,
    });
  }

  console.log(`✅ Created ${createdCustomers.length} customers.`);
  console.log(`✅ Created ${orders.length} orders.`);
  console.log('🎉 Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });