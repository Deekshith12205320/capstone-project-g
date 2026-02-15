// src/services/llm.js
// Providers: 'gemini' (real via REST v1), 'mock' (no key)

import 'dotenv/config';

// -----------------------------------------------------------------------------
// Helper: enforce a gentle follow-up question (non-crisis only)
// -----------------------------------------------------------------------------
function ensureFollowUpQuestion(text) {
  if (!text) return text;

  const trimmed = text.trim();
  if (trimmed.endsWith('?')) return text;

  const followUps = [
    "Would you like to tell me a bit more about how this has been affecting you?",
    "What feels hardest for you right now?",
    "Do you want to share what’s been weighing on you the most?"
  ];

  const followUp = followUps[Math.floor(Math.random() * followUps.length)];
  return `${text}\n\n${followUp}`;
}

// -----------------------------------------------------------------------------
// Main LLM entry
// -----------------------------------------------------------------------------
export async function llmChat(
  messages,
  { temperature = 0.5, maxTokens = 700 } = {}
) {
  const provider = (process.env.LLM_PROVIDER || 'mock').toLowerCase();
  console.log('[LLM] provider =', provider);

  // ✅ Supported Gemini model
  const modelName = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';
  console.log('[LLM] model =', modelName);

  // ---------------------------------------------------------------------------
  // MOCK MODE (no API key)
  // ---------------------------------------------------------------------------
  if (provider === 'mock') {
    const userMessage =
      messages.find(m => m.role === 'user')?.content || '';

    const crisisKeywords = [
      'suicide',
      'kill myself',
      'self harm',
      'end my life'
    ];

    const isCrisis = crisisKeywords.some(k =>
      userMessage.toLowerCase().includes(k)
    );

    if (isCrisis) {
      return "I’m really worried about your safety. If you're in immediate danger, please contact local emergency services or a trusted person right now.";
    }

    const baseReply = `Mock Reply (LLM disabled): I hear you. "${userMessage.slice(
      0,
      200
    )}"`;

    return ensureFollowUpQuestion(baseReply);
  }

  // ---------------------------------------------------------------------------
  // REAL GEMINI MODE (REST v1)
  // ---------------------------------------------------------------------------
  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw Object.assign(
        new Error('GEMINI_API_KEY missing in .env'),
        { status: 500 }
      );
    }

    // Merge all system messages into one instruction block
    const systemText = messages
      .filter(m => m.role === 'system')
      .map(m => m.content)
      .join('\n\n')
      .trim();

    const contents = [];

    if (systemText) {
      contents.push({
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTION:\n${systemText}` }]
      });
    }

    for (const m of messages) {
      if (m.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: m.content }]
        });
      } else if (m.role === 'assistant') {
        contents.push({
          role: 'model',
          parts: [{ text: m.content }]
        });
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`;

    const body = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const rawText = await res.text();

      // 🔴 Handle Gemini quota / rate-limit gracefully
      if (!res.ok) {
        console.warn('[Gemini REST error]', res.status, rawText);

        if (
          res.status === 429 ||
          rawText.includes('RESOURCE_EXHAUSTED') ||
          rawText.includes('quota')
        ) {
          console.warn('[Gemini] Quota exceeded — using fallback response');

          return ensureFollowUpQuestion(
            "I’m really glad you reached out. I might be a bit limited right now, but I’m still here with you. What you’re feeling matters, and we can take this one step at a time."
          );
        }

        throw Object.assign(
          new Error('LLM_generation_failed'),
          { status: 502 }
        );
      }

      const json = JSON.parse(rawText);
      const out =
        extractText(json) ||
        'Sorry, I could not generate a response right now.';

      // ✅ Enforce human-like follow-up
      return ensureFollowUpQuestion(out);
    } catch (err) {
      console.error('[Gemini REST fatal]', err?.message || err);

      // Final safety fallback
      return ensureFollowUpQuestion(
        "I’m here with you, even if something didn’t work perfectly just now. You’re not alone in this. Would you like to share what’s been on your mind?"
      );
    }
  }

  throw Object.assign(
    new Error(`Unsupported LLM provider: ${provider}`),
    { status: 500 }
  );
}

// -----------------------------------------------------------------------------
// Safe text extraction from Gemini REST v1 response
// -----------------------------------------------------------------------------
function extractText(resp) {
  const parts = resp?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map(p => p?.text || '').join('').trim();
  }
  return '';
}
