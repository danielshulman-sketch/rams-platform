
async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3001/auth/login', {
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
        console.log('Login successful, token obtained.');

        console.log('Fetching /jobs...');
        const jobsRes = await fetch('http://localhost:3001/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (jobsRes.ok) {
            const data = await jobsRes.json();
            console.log('/jobs success:', jobsRes.status, data.length, 'jobs found');
        } else {
            console.log('/jobs FAILED:', jobsRes.status);
            console.log(await jobsRes.text());
        }

        console.log('Fetching /knowledge-base...');
        const kbRes = await fetch('http://localhost:3001/knowledge-base', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (kbRes.ok) {
            const data = await kbRes.json();
            console.log('/knowledge-base success:', kbRes.status, data.length, 'items found');
        } else {
            console.log('/knowledge-base FAILED:', kbRes.status);
            console.log(await kbRes.text());
        }

        console.log('Fetching /templates...');
        const tplRes = await fetch('http://localhost:3001/templates', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (tplRes.ok) {
            const data = await tplRes.json();
            console.log('/templates success:', tplRes.status, data.length, 'templates found');
        } else {
            console.log('/templates FAILED:', tplRes.status);
            console.log(await tplRes.text());
        }

    } catch (error) {
        console.error('Script error:', error.message);
    }
}

test();
