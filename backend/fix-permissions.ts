
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPermissions() {
    try {
        const email = 'daniel.shulman@gmail.com';
        console.log(`Fixing permissions for ${email}...`);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            console.error('User not found!');
            return;
        }

        console.log('Current Role:', user.role.name);
        console.log('Current Permissions:', user.role.permissions);

        const adminPermissions = [
            'rams.create',
            'rams.edit',
            'rams.delete',
            'rams.export',
            'jobs.create',
            'jobs.edit',
            'jobs.delete',
            'templates.manage',
            'users.manage',
            'org.settings',
            'knowledge.create',     // Adding these just in case
            'knowledge.edit',
            'knowledge.delete'
        ];

        await prisma.role.update({
            where: { id: user.roleId },
            data: {
                permissions: JSON.stringify(adminPermissions)
            }
        });

        console.log('Permissions updated to:', JSON.stringify(adminPermissions));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fixPermissions();
