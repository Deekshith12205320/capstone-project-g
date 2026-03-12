import fetch from 'node-fetch';

async function test() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:8081/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_chat@example.com', password: 'password123' })
        });
        const data = await loginRes.json();
        if (!loginRes.ok) {
            console.error("Login failed:", data);
            return;
        }

        console.log("Adding mock assessment to history...");
        const submitRes = await fetch('http://localhost:8081/assessments/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
                type: 'phq9',
                answers: [1, 2, 3, 1, 0, 0, 1, 2, 3]
            })
        });
        const submitData = await submitRes.json();
        console.log("Mock assessment submitted:", submitData.message);

        console.log("Fetching dynamic daily assessment...");
        
        // Add timeout explicitly to see if it's hanging at fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const res = await fetch('http://localhost:8081/assessments/daily', {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            clearTimeout(timeoutId);
            
            console.log("Status:", res.status);
            const assessment = await res.json();
            console.log("Title:", assessment.title);
            console.log("Description:", assessment.description);
            console.log("Questions:");
            if (assessment.items) {
                assessment.items.forEach((item, i) => {
                    console.log(`  ${i+1}. ${item.text}`);
                });
            } else {
                 console.log("No items found:", assessment);
            }
        } catch(e) {
             console.log("Fetch was aborted / timed out:", e);
        }

    } catch (e) {
        console.error("Catch error:", e);
    }
}
test().then(() => console.log('Done')).catch(console.error);
