
require('dotenv').config();
const OpenAI = require('openai');

async function testAi() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('Checking API Key:', apiKey ? `Present (starts with ${apiKey.substring(0, 7)}...)` : 'MISSING');

        if (!apiKey) {
            console.error('ERROR: OPENAI_API_KEY is missing from .env');
            return;
        }

        const openai = new OpenAI({ apiKey });

        console.log('Sending test request to OpenAI...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: "Say Hello" }],
            model: "gpt-4o",
        });

        console.log('AI Response:', completion.choices[0].message.content);
        console.log('AI Integration SUCCESS');

    } catch (error) {
        console.error('AI Test FAILED:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAi();
