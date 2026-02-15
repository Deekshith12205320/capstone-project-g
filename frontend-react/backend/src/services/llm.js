// src/services/llm.js
// Providers: 'gemini' (real via REST v1), 'mock' (no key)
import 'dotenv/config';

export async function llmChat(messages, { temperature = 0.5, maxTokens = 700 } = {}) {
  const provider = (process.env.LLM_PROVIDER || 'mock').toLowerCase();
  console.log('[LLM] provider =', provider);

  // ✅ Use your REAL supported model
  const modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
  console.log('[LLM] model =', modelName);

  // -------------------------------------------------------------------------
  // ✅ MOCK MODE
  // -------------------------------------------------------------------------
  if (provider === 'mock') {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const crisisKeywords = ['suicide', 'kill myself', 'self harm', 'end my life'];
    const isCrisis = crisisKeywords.some(k => userMessage.toLowerCase().includes(k));
    if (isCrisis) {
      return "I’m really worried about your safety. If you're in any immediate danger, please contact local emergency services or a trusted person near you right now.";
    }
    return `Mock Reply (LLM disabled): I hear you. "${userMessage.slice(0, 200)}"`;
  }

  // -------------------------------------------------------------------------
  // ✅ REAL GEMINI MODE (REST v1)
  // -------------------------------------------------------------------------
  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw Object.assign(new Error("GEMINI_API_KEY missing in .env"), { status: 500 });
    }

    // ✅ Combine system messages into first user message
    const systemText =
      messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n').trim();

    const chatMessages = messages.filter(m => m.role !== 'system');
    const contents = [];
    let systemAdded = false;

    for (const m of chatMessages) {
      if (m.role === "user") {
        let text = m.content;
        // Prepend system instruction to the very first user message we encounter
        if (!systemAdded && systemText) {
          text = `SYSTEM INSTRUCTION:\n${systemText}\n\n${text}`;
          systemAdded = true;
        }
        contents.push({ role: "user", parts: [{ text }] });
      } else if (m.role === "assistant") {
        contents.push({ role: "model", parts: [{ text: m.content }] });
      }
    }

    // Safety fallback: if no user message existed, send system text as user message
    if (!systemAdded && systemText) {
      contents.push({
        role: "user",
        parts: [{ text: `SYSTEM INSTRUCTION:\n${systemText}` }]
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    const body = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const txt = await res.text();
      if (!res.ok) {
        console.error("[Gemini REST error]", res.status, txt);
        throw Object.assign(new Error("LLM_generation_failed"), { status: 502 });
      }

      const json = JSON.parse(txt);

      return extractText(json) || "Sorry, I could not generate a response right now.";
    } catch (err) {
      console.error("[Gemini REST fatal]", err?.message || err);
      throw Object.assign(new Error("LLM_generation_failed"), { status: 502 });
    }
  }

  throw Object.assign(new Error(`Unsupported LLM provider: ${provider}`), { status: 500 });
}

// ✅ Extract text safely from REST v1 response
function extractText(resp) {
  const parts = resp?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map(p => p?.text || "").join("").trim();
  }
  return "";
}
