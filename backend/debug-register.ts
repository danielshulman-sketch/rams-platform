
async function test() {
    try {
        console.log('Attempting registration...');
        const uniqueEmail = `test.user.${Date.now()}@example.com`;

        const res = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                organizationName: 'Test Org ' + Date.now()
            })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Registration SUCCESS:', data.user.email);
        } else {
            console.log('Registration FAILED:', res.status);
            console.log(await res.text());
        }
    } catch (error) {
        console.error('Script error:', error.message);
    }
}

test();
