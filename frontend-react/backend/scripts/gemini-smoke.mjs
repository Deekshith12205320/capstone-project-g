import 'dotenv/config';

const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${key}`;

const body = {
  contents: [{ role: 'user', parts: [{ text: 'Say hello in one short sentence.' }] }]
};

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const txt = await res.text();
console.log('STATUS:', res.status);
console.log(txt);
