
async function test() {
    try {
        console.log('Attempting login with admin credentials...');
        const email = 'daniel.shulman@gmail.com';
        const password = 'password123';

        const res = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Login SUCCESS!');
            console.log('Token:', data.token ? 'Received' : 'Missing');
            console.log('User Role:', data.user.role);
            console.log('Permissions:', Array.isArray(data.user.permissions) ? 'Valid Array' : typeof data.user.permissions);
        } else {
            console.log('Login FAILED:', res.status);
            console.log(await res.text());
        }
    } catch (error) {
        console.error('Script error:', error.message);
    }
}

test();
