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
  { temperature = 0.5, maxTokens = 700, forceGemini } = {}
) {
  const provider = (process.env.LLM_PROVIDER || 'mock').toLowerCase();
  console.log('[LLM] provider =', provider);

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

    return baseReply;
  }

  // ---------------------------------------------------------------------------
  // GROQ MODE (OpenAI Compatible)
  // ---------------------------------------------------------------------------
  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      console.warn('[Groq] API key missing, falling back to Gemini');
      return llmChat(messages, { temperature, maxTokens, forceGemini: true });
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : m.role,
            content: m.content
          })),
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[Groq Error]', response.status, errorData);
        throw new Error('Groq API call failed');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.error('[Groq Fatal]', err.message);
      // Automatic fallback to Gemini if Groq fails
      return llmChat(messages, { temperature, maxTokens, forceGemini: true });
    }
  }

  // ---------------------------------------------------------------------------
  // REAL GEMINI MODE (REST v1)
  // ---------------------------------------------------------------------------
  if (provider === 'gemini' || forceGemini) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw Object.assign(
        new Error('GEMINI_API_KEY missing in .env'),
        { status: 500 }
      );
    }

    // ✅ Supported Gemini model
    const modelName = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash';
    console.log('[LLM] model =', modelName);

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

          return "I’m really glad you reached out. I might be a bit limited right now, but I’m still here with you. What you’re feeling matters, and we can take this one step at a time.";
        }

        throw Object.assign(
          new Error('LLM_generation_failed'),
          { status: 502 }
        );
      }

      const json = JSON.parse(rawText);
      return (
        extractText(json) ||
        'Sorry, I could not generate a response right now.'
      );
    } catch (err) {
      console.error('[Gemini REST fatal]', err?.message || err);

      return "I’m here with you, even if something didn’t work perfectly just now. You’re not alone in this. Would you like to share what’s been on your mind?";
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
