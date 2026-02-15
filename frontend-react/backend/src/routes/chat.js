import { Router } from 'express';
import { z } from 'zod';

import { llmChat } from '../services/llm.js';
import {
  buildStudentChat,
  buildAssessmentChat
} from '../services/prompts.js';

import { screenRisk } from '../services/safety.js';
import {
  getCrisisResponse,
  getViolenceResponse
} from '../services/crisisResponse.js';

import { getAssessment } from '../services/assessments.js';
import {
  scoreAssessment,
  categorizeScore
} from '../services/scoring.js';
import db from '../db/database.js';

const router = Router();

// ===============================
// GET HISTORY
// ===============================
router.get('/history', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM chats ORDER BY id ASC').all();
    res.json(history);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ===============================
// CLEAR HISTORY
// ===============================
router.delete('/history', (req, res) => {
  try {
    db.prepare('DELETE FROM chats').run();
    res.json({ message: 'History cleared' });
  } catch (error) {
    console.error('Failed to clear history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// ===============================
// GET ASSESSMENTS HISTORY
// ===============================
router.get('/assessments', (req, res) => {
  try {
    const assessments = db.prepare('SELECT * FROM assessments ORDER BY timestamp DESC').all();
    // Parse answers JSON
    const formatted = assessments.map(a => ({
      ...a,
      answers: JSON.parse(a.answers)
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

/**
 * Request schema
 * - text → normal chat
 * - action=start_assessment → send questionnaire
 * - action=submit_assessment → score + AI response
 */
const schema = z.object({
  text: z.string().min(1).max(2000).optional(),
  action: z.enum(['start_assessment', 'submit_assessment']).optional(),
  type: z.string().optional(),
  answers: z.record(z.number()).optional()
});

router.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);

    // ===============================
    // 1️⃣ START ASSESSMENT
    // ===============================
    if (body.action === 'start_assessment') {
      const { type } = body;

      if (!type) {
        return res.status(400).json({ error: 'Assessment type is required' });
      }

      const assessmentData = getAssessment(type);

      // Parse scale into options
      // Example scale: "0=Not at all, 1=Several days, 2=More than half the days, 3=Nearly every day"
      const options = assessmentData.scale.split(', ').map(s => {
        const [val, txt] = s.split('=');
        return { value: parseInt(val), text: txt };
      });

      const questions = assessmentData.items.map((text, index) => ({
        id: `${type}_q${index + 1}`,
        text,
        options
      }));

      return res.json({
        assessment: true,
        type,
        message: 'Please answer the following questions honestly.',
        questions
      });
    }

    // ===============================
    // 2️⃣ SUBMIT ASSESSMENT
    // ===============================
    if (body.action === 'submit_assessment') {
      const { type, answers } = body;

      if (!type || !answers) {
        return res
          .status(400)
          .json({ error: 'Assessment type and answers are required' });
      }

      const score = scoreAssessment(type, answers);
      const severity = categorizeScore(type, score);

      const messages = buildAssessmentChat(type, score, severity);

      const content = await llmChat(messages, {
        temperature: 0.4,
        maxTokens: 500
      });

      // Save Assessment Result
      try {
        db.prepare(`
          INSERT INTO assessments (type, score, severity, answers, insight)
          VALUES (?, ?, ?, ?, ?)
        `).run(type, score, severity, JSON.stringify(answers), content);
      } catch (err) {
        console.error('Failed to save assessment:', err);
      }

      return res.json({
        assessmentComplete: true,
        type,
        score,
        severity,
        reply: content
      });
    }

    // ===============================
    // 3️⃣ NORMAL CHAT FLOW
    // ===============================
    const { text } = body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const { crisis, flags, trigger } = screenRisk(text);

    // 🚨 HIGH-RISK MODE — STOP AI COMPLETELY
    if (crisis) {
      console.warn('[CRISIS] High-risk message detected:', flags);

      router.stats = router.stats || { total: 0, crisisCount: 0, tags: {} };
      router.stats.total++;
      router.stats.crisisCount++;
      flags.forEach(f => (router.stats.tags[f] = (router.stats.tags[f] || 0) + 1));

      if (flags.includes('self_harm')) {
        const response = getCrisisResponse(trigger);
        // Save Crisis Response
        db.prepare('INSERT INTO chats (role, content, is_crisis) VALUES (?, ?, 1)').run('ai', response.reply || response.message, 1);
        return res.status(200).json(response);
      }

      if (flags.includes('harm_to_others')) {
        const response = getViolenceResponse();
        // Save Crisis Response
        db.prepare('INSERT INTO chats (role, content, is_crisis) VALUES (?, ?, 1)').run('ai', response.reply || response.message, 1);
        return res.status(200).json(response);
      }

      const response = getCrisisResponse(trigger);
      // Save Crisis Response
      db.prepare('INSERT INTO chats (role, content, is_crisis) VALUES (?, ?, 1)').run('ai', response.reply || response.message, 1);
      return res.status(200).json(response);
    }

    // ✅ NON-CRISIS CHAT → AI
    // Save User Message
    db.prepare('INSERT INTO chats (role, content) VALUES (?, ?)').run('user', text);

    const messages = buildStudentChat(text, flags);

    const content = await llmChat(messages, {
      temperature: 0.5,
      maxTokens: 4000
    });

    // Save AI Response
    db.prepare('INSERT INTO chats (role, content) VALUES (?, ?)').run('ai', content);

    // analytics
    router.stats = router.stats || { total: 0, crisisCount: 0, tags: {} };
    router.stats.total++;
    flags.forEach(f => (router.stats.tags[f] = (router.stats.tags[f] || 0) + 1));

    // 🔹 Suggest assessment (frontend button trigger)
    const suggestAssessment = flags.includes('stress') || flags.includes('anxiety');

    res.json({
      reply: content,
      crisis: false,
      flags,
      ...(suggestAssessment
        ? {
          suggestion: {
            message:
              'Would you like to take a short assessment to understand this better?',
            options: [
              { label: 'Stress Test', type: 'pss10' },
              { label: 'Anxiety Test', type: 'gad7' },
              { label: 'Depression Test', type: 'phq9' }
            ]
          }
        }
        : {})
    });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (_req, res) => {
  res.json(router.stats || { total: 0, crisisCount: 0, tags: {} });
});

export default router;
