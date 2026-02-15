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
  getConversationContext
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
      addMessage(userId, 'user', text);

      return res.status(200).json(
        getCrisisResponse(flags)
      );
    }

    // -------------------------------------------------------------------------
    // 🧠 Fetch latest assessment context (severity memory)
    // -------------------------------------------------------------------------
    const latestAssessment = getLatestAssessment(userId);

    // -------------------------------------------------------------------------
    // 🧠 Fetch short-term conversation context
    // -------------------------------------------------------------------------
    const conversationContext = getConversationContext(userId);

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
    addMessage(userId, 'user', text);
    addMessage(userId, 'assistant', reply);

    // -------------------------------------------------------------------------
    // 📊 Analytics (aggregate only)
    // -------------------------------------------------------------------------
    trackChat(flags);

    // -------------------------------------------------------------------------
    // Response
    // -------------------------------------------------------------------------
    res.json({
      reply,
      crisis: false,
      flags,
      assessmentContext: latestAssessment || null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
