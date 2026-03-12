import fetch from 'node-fetch';

async function test() {
    try {
        const res = await fetch('http://localhost:8081/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: 'test_chat@example.com', password: 'password123' })
        });

        let data = await res.json();

        if (!res.ok) {
            console.log('Register failed, trying login...');
            const loginRes = await fetch('http://localhost:8081/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test_chat@example.com', password: 'password123' })
            });
            data = await loginRes.json();
            if (!loginRes.ok) {
                console.error("Login failed:", data);
                return;
            }
        }

        console.log("Token:", data.token);

        const chatRes = await fetch('http://localhost:8081/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({ text: "Hello, this is a test" })
        });

        console.log("Status:", chatRes.status);
        const chatData = await chatRes.json();
        console.log("Chat Response:", JSON.stringify(chatData, null, 2));

    } catch (e) {
        console.error("Catch error:", e);
    }
}
test();
