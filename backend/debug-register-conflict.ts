
async function test() {
    try {
        console.log('Attempting registration with EXISTING email...');
        const email = 'daniel.shulman@gmail.com'; // Already exists

        const res = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: 'password123',
                firstName: 'Duplicate',
                lastName: 'User',
                organizationName: 'Duplicate Org'
            })
        });

        console.log('Status:', res.status);
        console.log('Response:', await res.text());

    } catch (error) {
        console.error('Script error:', error.message);
    }
}

test();
