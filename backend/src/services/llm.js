import 'dotenv/config';
import OpenAI from 'openai';
import { DYNAMIC_ASSESSMENT_PROMPT } from './prompts.js';

// -----------------------------------------------------------------------------
// Initialize Clients
// -----------------------------------------------------------------------------
const groq = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
}) : null;

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
  if (!groq) {
    return "I am currently in demo mode. Please configure your API keys in .env to enable my full capabilities.";
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
    return "I'm here with you, but I'm having a small technical hiccup. Even so, your feelings are valid—would you like to tell me more about what's on your mind?";
  }
}

// -----------------------------------------------------------------------------
// Dynamic Assessment Generation
// -----------------------------------------------------------------------------

export async function generateDynamicQuestions(historyContext) {
  if (!groq) return null;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" }, // ensure JSON output
      messages: [
        {
          role: 'system',
          content: DYNAMIC_ASSESSMENT_PROMPT
        },
        {
          role: 'user',
          content: `Here is my assessment history for the past 7 days:\n\n${JSON.stringify(historyContext, null, 2)}\n\nPlease generate 10 targeted questions in a JSON array under the key "questions".`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (result.questions && Array.isArray(result.questions) && result.questions.length === 10) {
      return result.questions;
    }
    return null;
  } catch (e) {
    console.error('[Groq Dynamic Assessment Error]', e.message);
    return null;
  }
}
