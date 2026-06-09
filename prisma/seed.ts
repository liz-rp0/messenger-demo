import { PrismaClient, Role, CaseStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.deliveryCase.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const u1 = await prisma.user.create({
    data: {
      username: 'admin_sayz',
      password: '1000',
      role: Role.ADMIN,
      name: 'Admin Sayz',
    },
  })

  const u2 = await prisma.user.create({
    data: {
      username: 'admin',
      password: '3144',
      role: Role.MANAGER,
      name: 'Manager',
    },
  })

  const u3 = await prisma.user.create({
    data: {
      username: 'mass1',
      password: '1111',
      role: Role.MESSENGER,
      name: 'Messenger 1',
    },
  })

  const u4 = await prisma.user.create({
    data: {
      username: 'mass2',
      password: '1111',
      role: Role.MESSENGER,
      name: 'Messenger 2',
    },
  })

  // Create Initial Delivery Case
  await prisma.deliveryCase.create({
    data: {
      orderNumber: 'IR-1001',
      rawDetails: 'ไปได้เลย เคสรับซื้อ/ฝาก iPhone 14 PRomax 256gb สีม่วง เครื่องสวยครบกล่อง รับซื้อ 14000 บาท เบอร์โทร 0852555555 https://maps.app.goo.gl/r9HvoFVmx4mQSwsY9',
      itemDetails: 'เคสรับซื้อ/ฝาก iPhone 14 PRomax 256gb สีม่วง เครื่องสวยครบกล่อง',
      price: '14,000',
      phone: '0852555555',
      mapUrl: 'https://maps.app.goo.gl/r9HvoFVmx4mQSwsY9',
      status: CaseStatus.PENDING,
    },
  })

  await prisma.inventoryItem.deleteMany()

  // Create Inventory Items from master SKU data
  const skuDataPath = path.join(__dirname, 'sku-data.json')
  if (fs.existsSync(skuDataPath)) {
    const skuItems = JSON.parse(fs.readFileSync(skuDataPath, 'utf8'))
    await prisma.inventoryItem.createMany({
      data: skuItems
    })
    console.log(`Seeded ${skuItems.length} inventory items from sku-data.json`)
  } else {
    // Fallback if file doesn't exist
    await prisma.inventoryItem.create({
      data: {
        sku: 'B-IP11',
        product_name: 'iPhone 11',
        category: 'Battery',
        stock_qty: 1,
        min_order_point: 2,
        status: 'Need to Order',
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
