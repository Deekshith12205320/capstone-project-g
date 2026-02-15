// src/routes/chat.js

import { Router } from 'express';
import { z } from 'zod';

import { llmChat } from '../services/llm.js';
import { buildStudentChat } from '../services/prompts.js';
import { screenRisk } from '../services/safety.js';
import { getCrisisResponse } from '../services/crisisResponse.js';
import { getLatestAssessment } from '../services/assessmentStore.js';
import {
  addMessage,
  getConversationContext,
  getHistory,
  clearHistory
} from '../services/conversationMemory.js';
import {
  trackChat,
  trackCrisis
} from '../services/analytics.js';

const router = Router();

// -----------------------------------------------------------------------------
// Request validation
// -----------------------------------------------------------------------------
const schema = z.object({
  text: z.string().min(1).max(2000)
});

// -----------------------------------------------------------------------------
// POST /chat
// Main conversational endpoint
// -----------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { text } = schema.parse(req.body);
    const userId = req.user.userId;

    // -------------------------------------------------------------------------
    // Safety screening
    // -------------------------------------------------------------------------
    const { crisis, flags } = screenRisk(text);

    // -------------------------------------------------------------------------
    // 🚨 CRISIS MODE — STOP AI COMPLETELY
    // -------------------------------------------------------------------------
    if (crisis) {
      trackCrisis(flags);

      // Store user message (but no assistant reply)
      await addMessage(userId, 'user', text);

      return res.status(200).json(
        getCrisisResponse(flags)
      );
    }

    // -------------------------------------------------------------------------
    // 🧠 Fetch latest assessment context (severity memory)
    // -------------------------------------------------------------------------
    const latestAssessment = await getLatestAssessment(userId);

    // -------------------------------------------------------------------------
    // 🧠 Fetch short-term conversation context
    // -------------------------------------------------------------------------
    const conversationContext = await getConversationContext(userId);

    // -------------------------------------------------------------------------
    // 🧩 Build AI prompt with assessment + conversation intelligence
    // -------------------------------------------------------------------------
    const messages = buildStudentChat(
      text,
      flags,
      latestAssessment,
      conversationContext
    );

    // -------------------------------------------------------------------------
    // 🤖 Call LLM
    // -------------------------------------------------------------------------
    const reply = await llmChat(messages, {
      temperature: 0.5,
      maxTokens: 600
    });

    // -------------------------------------------------------------------------
    // 🧠 Store conversation memory (privacy-safe)
    // -------------------------------------------------------------------------
    await addMessage(userId, 'user', text);
    await addMessage(userId, 'assistant', reply);

    // -------------------------------------------------------------------------
    // 📊 Analytics (aggregate only)
    // -------------------------------------------------------------------------
    trackChat(flags);

    // -------------------------------------------------------------------------
    // Response
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // 💡 Assessment Suggestion Logic (Keyword-based or AI-driven)
    // -------------------------------------------------------------------------


    // -------------------------------------------------------------------------
    // 💡 Assessment Suggestion Logic (Context-Aware)
    // -------------------------------------------------------------------------
    let suggestion = null;
    const lowerText = text.toLowerCase();

    // Helper to add suggestion if not already present
    const addSuggestion = (msg, label, type) => {
      if (!suggestion) {
        suggestion = {
          message: msg,
          options: [{ label, type }]
        };
      } else {
        // Add option if not exists
        if (!suggestion.options.find(o => o.type === type)) {
          suggestion.options.push({ label, type });
        }
      }
    };

    // Stress Context
    if (lowerText.includes('stress') || lowerText.includes('overwhelmed') || lowerText.includes('pressure')) {
      addSuggestion("It sounds like you're under a lot of pressure. Would it help to check your stress levels?", "Take Stress Check (PSS-10)", "pss10");
    }

    // Anxiety Context
    if (lowerText.includes('anxiet') || lowerText.includes('worry') || lowerText.includes('panic') || lowerText.includes('nervous')) {
      addSuggestion("I hear that you're feeling anxious. We can check the severity of that anxiety if you like.", "Check Anxiety (GAD-7)", "gad7");
    }

    // Burnout Context
    if (lowerText.includes('burnout') || lowerText.includes('burned out') || lowerText.includes('exhausted') || lowerText.includes('tired')) {
      addSuggestion("Feeling exhausted can be a sign of burnout. Want to see where you stand?", "Check Burnout", "burnout");
    }

    // Depression Context
    if (lowerText.includes('depress') || lowerText.includes('sad') || lowerText.includes('hopeless') || lowerText.includes('down')) {
      addSuggestion("I'm sorry you're feeling this way. It might be helpful to screen for depression symptoms.", "Depression Screen (PHQ-9)", "phq9");
    }

    res.json({
      reply,
      crisis: false,
      flags,
      assessmentContext: latestAssessment || null,
      suggestion // ✅ Send contextual suggestion to frontend
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /chat/status
// Returns the availability of AI providers
// -----------------------------------------------------------------------------
router.get('/status', (req, res) => {
  res.json({
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY
  });
});

// -----------------------------------------------------------------------------
// GET /chat/history
// Returns recent conversation history
// -----------------------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await getHistory(userId);
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// -----------------------------------------------------------------------------
// DELETE /chat/history
// Clears conversation history
// -----------------------------------------------------------------------------
router.delete('/history', (req, res) => {
  const userId = req.user.userId;
  clearHistory(userId);
  res.json({ success: true, message: 'History cleared' });
});

export default router;
