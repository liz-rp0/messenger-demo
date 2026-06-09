import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { username: 'admin_wan' },
    update: {
      password: '036345',
      role: Role.ADMIN,
      name: 'Kamonwan',
    },
    create: {
      username: 'admin_wan',
      password: '036345',
      role: Role.ADMIN,
      name: 'Kamonwan',
    },
  })

  console.log('User created or updated:', user.username)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
