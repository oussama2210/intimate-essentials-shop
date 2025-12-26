import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getWilayaList } from '@dzcode-io/leblad';
import { wilayasData } from './data/wilayas';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Wilayas and Baladiyas FIRST
  console.log('Seeding Wilayas and Baladiyas...');

  // Map to store full cost details
  const deliveryCostMap = new Map<number, { home: number, office: number }>();
  wilayasData.forEach(w => {
    deliveryCostMap.set(Number(w.code), {
      home: w.homeDeliveryCost,
      office: w.officeDeliveryCost
    });
  });

  const lebladWilayas = getWilayaList();

  let defaultWilayaId: number | null = null;
  let defaultBaladiyaId: number | null = null;

  for (const wilaya of lebladWilayas) {
    const costs = deliveryCostMap.get(wilaya.mattricule) || { home: 800, office: 500 };
    const code = wilaya.mattricule.toString().padStart(2, '0');

    const createdWilaya = await prisma.wilaya.upsert({
      where: { id: wilaya.mattricule },
      update: {
        name: wilaya.name_ar,
        code: code,
        deliveryBaseCost: costs.home, // Keep base as home for now
        homeDeliveryCost: costs.home,
        officeDeliveryCost: costs.office,
      },
      create: {
        id: wilaya.mattricule,
        name: wilaya.name_ar,
        code: code,
        deliveryBaseCost: costs.home,
        homeDeliveryCost: costs.home,
        officeDeliveryCost: costs.office,
      },
    });

    if (!defaultWilayaId) defaultWilayaId = createdWilaya.id;

    console.log(`Seeded Wilaya: ${createdWilaya.name}`);

    // Create Delivery Zone (One per Wilaya)
    let zone = await prisma.deliveryZone.findFirst({
      where: { wilayaId: createdWilaya.id }
    });

    if (!zone) {
      zone = await prisma.deliveryZone.create({
        data: {
          wilayaId: createdWilaya.id,
          baseCost: costs.home,
          estimatedDays: 3, // Default estimated days
          isActive: true,
        }
      });
    }

    // Create Baladiyas
    if (wilaya.dairats) {
      for (const daira of wilaya.dairats) {
        if (daira.baladyiats) {
          for (const baladiya of daira.baladyiats) {
            await prisma.baladiya.upsert({
              where: { id: baladiya.code },
              update: {
                name: baladiya.name_ar,
                wilayaId: createdWilaya.id,
                postalCode: baladiya.code.toString(),
              },
              create: {
                id: baladiya.code,
                name: baladiya.name_ar,
                wilayaId: createdWilaya.id,
                postalCode: baladiya.code.toString(),
              },
            });

            if (createdWilaya.id === defaultWilayaId && !defaultBaladiyaId) {
              defaultBaladiyaId = baladiya.code;
            }
          }
        }
      }
    }
  }

  // 2. Create Categories
  const categoryName = 'General';
  let generalCategory = await prisma.category.findFirst({
    where: { name: categoryName }
  });

  if (!generalCategory) {
    generalCategory = await prisma.category.create({
      data: {
        name: categoryName,
        description: 'General products',
      }
    });
  }
  console.log('Category seeded');

  // 3. Create Admin User
  if (defaultWilayaId && defaultBaladiyaId) {
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminPhone = '0550000000';

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        // password and role removed as they don't exist on User model
        firstName: 'Admin',
        lastName: 'User',
        phone: adminPhone,
        wilayaId: defaultWilayaId,
        baladiyaId: defaultBaladiyaId,
      },
    });
    console.log('Admin user seeded');
  } else {
    console.warn('Could not seed Admin user: No location data found.');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });