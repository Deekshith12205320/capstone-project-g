import 'dotenv/config';

const url = `https://generativelanguage.googleapis.com/v1/models/${process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest'}:generateContent?key=${process.env.GEMINI_API_KEY}`;
const body = {
  contents: [{ role: 'user', parts: [{ text: 'Say hello in one short sentence.' }] }]
};

const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const txt = await res.text();
console.log('STATUS:', res.status);
console.log(txt);
