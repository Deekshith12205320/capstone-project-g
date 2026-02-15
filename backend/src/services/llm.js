// src/services/llm.js
import 'dotenv/config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// -----------------------------------------------------------------------------
// Initialize Clients
// -----------------------------------------------------------------------------
const groq = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
}) : null;

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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
  { temperature = 0.5, maxTokens = 700, forceGemini = false } = {}
) {
  const provider = (process.env.LLM_PROVIDER || 'mock').toLowerCase();

  // ---------------------------------------------------------------------------
  // MOCK MODE (no API key)
  // ---------------------------------------------------------------------------
  if (provider === 'mock') {
    return "I am currently in demo mode. Please configure your API keys in .env to enable my full capabilities.";
  }

  // ---------------------------------------------------------------------------
  // GROQ MODE (Using OpenAI SDK)
  // ---------------------------------------------------------------------------
  if (provider === 'groq' && !forceGemini) {
    if (!groq) {
      console.warn('[Groq] Client not initialized, falling back to Gemini');
      return llmChat(messages, { temperature, maxTokens, forceGemini: true });
    }

    try {
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        temperature,
        max_tokens: maxTokens,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('[Groq Error]', err.message);
      // Automatic fallback to Gemini if Groq fails
      return llmChat(messages, { temperature, maxTokens, forceGemini: true });
    }
  }

  // ---------------------------------------------------------------------------
  // GEMINI MODE (Using Google SDK)
  // ---------------------------------------------------------------------------
  if (provider === 'gemini' || forceGemini) {
    if (!genAI) {
      return "I'm having trouble connecting to my brain right now. Please check if the API keys are correctly set.";
    }

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      // Strip 'models/' prefix if present for the SDK
      const sanitizedModelName = modelName.startsWith('models/') ? modelName.split('/')[1] : modelName;

      const model = genAI.getGenerativeModel({ model: sanitizedModelName });

      // Separate system instruction
      const systemInstruction = messages
        .filter(m => m.role === 'system')
        .map(m => m.content)
        .join('\n\n');

      // Convert history for Gemini format
      const history = messages
        .filter(m => m.role !== 'system')
        .slice(0, -1) // All but the last user message
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const lastUserMsg = messages[messages.length - 1].content;

      const chat = model.startChat({
        history,
        systemInstruction,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const result = await chat.sendMessage(lastUserMsg);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('[Gemini Error]', err.message);

      if (err.message?.includes('quota') || err.message?.includes('429')) {
        return "I'm a little overwhelmed with requests right now. Let's take a short break and try again in a moment. I'm still here for you.";
      }

      return "I'm here with you, but I'm having a small technical hiccup. Even so, your feelings are valid—would you like to tell me more about what's on your mind?";
    }
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
}
