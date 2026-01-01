
async function test() {
    try {
        console.log('Forcing error...');
        // We'll try to access a non-existent endpoint or pass bad data to trigger general error
        // But better, let's just run the job fetch again and see if it logs anything

        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'daniel.shulman@gmail.com',
                password: 'password123'
            })
        });
        const { token } = await loginRes.json();

        const res = await fetch('http://localhost:3001/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Job fetch status:', res.status);

    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
