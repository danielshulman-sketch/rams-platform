import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

console.log('Prisma keys:', Object.keys(prisma))
// console.log('Prisma _dmmf:', (prisma as any)._dmmf)

async function main() {
    const email = 'daniel.shulman@gmail.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Clean up existing data
    await (prisma as any).user.deleteMany({ where: { email } }).catch(() => { })

    // Create Organization
    console.log('Creating organization...')
    const org = await (prisma as any).organization.create({
        data: {
            name: 'Rams Platform',
            settings: JSON.stringify({})
        }
    })

    // Create Roles
    console.log('Creating roles...')
    const adminRole = await (prisma as any).role.create({
        data: {
            name: 'Admin',
            organizationId: org.id,
            permissions: JSON.stringify(['*'])
        }
    })

    // Create User
    console.log('Creating user...')
    const user = await (prisma as any).user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            firstName: 'Daniel',
            lastName: 'Shulman',
            organizationId: org.id,
            roleId: adminRole.id,
            isActive: true
        }
    })

    console.log({ user })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
