
async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'daniel.shulman@gmail.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful.');

        console.log('Fetching /api/jobs...');
        const jobsRes = await fetch('http://localhost:3001/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (jobsRes.ok) {
            const data = await jobsRes.json();
            console.log('/api/jobs success: found', data.length);
        } else {
            console.log('/api/jobs FAILED:', jobsRes.status);
            console.log(await jobsRes.text());
        }

        console.log('Fetching /api/knowledge-base...');
        const kbRes = await fetch('http://localhost:3001/api/knowledge-base', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (kbRes.ok) {
            const data = await kbRes.json();
            console.log('/api/knowledge-base success: found', data.length);
        } else {
            console.log('/api/knowledge-base FAILED:', kbRes.status);
            console.log(await kbRes.text());
        }

    } catch (error) {
        console.error('Script error:', error.message);
    }
}

test();
