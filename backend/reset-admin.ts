
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function reset() {
    try {
        const email = 'daniel.shulman@gmail.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`Resetting password for ${email}...`);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash: hashedPassword,
                isActive: true,
            },
            create: {
                email,
                passwordHash: hashedPassword,
                firstName: 'Daniel',
                lastName: 'Shulman',
                organization: {
                    create: {
                        name: 'Admin Org',
                        settings: '{}'
                    }
                },
                role: {
                    create: {
                        name: 'Admin',
                        organizationId: 'temp', // This will fail if not handled, but upsert usually finds existing
                        permissions: '[]'
                    }
                }
            }
        }).catch(async (e) => {
            // Fallback if upsert create fails due to complexity
            console.log('Upsert failed, trying update only...');
            return await prisma.user.update({
                where: { email },
                data: { passwordHash: hashedPassword, isActive: true }
            });
        });

        console.log('Password reset successful.');

        // Now test login via API
        console.log('Testing login via API...');
        const res = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: newPassword })
        });

        if (res.ok) {
            console.log('Login API SUCCESS!');
        } else {
            console.log('Login API FAILED:', res.status);
            console.log(await res.text());
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

reset();
