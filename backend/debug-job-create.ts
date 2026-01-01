
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

        if (!loginRes.ok) throw new Error('Login failed');
        const { token } = await loginRes.json();
        console.log('Login success.');

        console.log('Attempting to create a job...');
        const jobRes = await fetch('http://localhost:3001/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                projectName: 'Debug Job ' + Date.now(),
                clientName: 'Debug Client',
                siteAddress: '123 Debug Lane',
                sitePostcode: 'SW1A 1AA',
                scopeOfWorks: 'Testing permissions'
            })
        });

        if (jobRes.ok) {
            console.log('Job Creation SUCCESS:', jobRes.status);
            const job = await jobRes.json();
            console.log('Created Job ID:', job.id);
        } else {
            console.log('Job Creation FAILED:', jobRes.status);
            console.log(await jobRes.text());
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
