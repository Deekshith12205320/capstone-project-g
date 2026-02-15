import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;

const res = await fetch(url);
const txt = await res.text();

console.log("STATUS:", res.status);
console.log(txt);
