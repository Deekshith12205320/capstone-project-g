// src/routes/assessments.js

import { Router } from 'express';
import { z } from 'zod';

import { trackAssessment } from '../services/analytics.js';
import { setUserSeverity } from '../services/userState.js';

import {
  listAssessments,
  getAssessment
} from '../services/assessments.js';

import {
  scoreLikert,
  interpretPHQ9,
  interpretGAD7,
  interpretPSS10,
  interpretBurnout
} from '../services/scoring.js';

import {
  saveLatestAssessment,
  getLatestAssessment
} from '../services/assessmentStore.js';

const router = Router();

// -----------------------------------------------------------------------------
// GET /assessments/list
// Returns list of available assessments (frontend cards)
// -----------------------------------------------------------------------------
router.get('/list', (_req, res) => {
  res.json({
    assessments: listAssessments()
  });
});

// -----------------------------------------------------------------------------
// GET /assessments/:type
// Returns questions + scale for a specific assessment
// -----------------------------------------------------------------------------
router.get('/:type', (req, res) => {
  const assessment = getAssessment(req.params.type);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  res.json({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    scale: assessment.scale,
    items: assessment.items
  });
});

// -----------------------------------------------------------------------------
// POST /assessments/submit
// Scores assessment, stores latest summary, updates AI mental state
// -----------------------------------------------------------------------------
const submitSchema = z.object({
  type: z.string(),
  answers: z.array(z.number().min(0).max(4))
});

router.post('/submit', (req, res) => {
  const { type, answers } = submitSchema.parse(req.body);
  const assessment = getAssessment(type);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  if (answers.length !== assessment.items.length) {
    return res.status(400).json({
      error: 'Answer count does not match number of questions'
    });
  }

  // ---------------------------------------------------------------------------
  // Score assessment
  // ---------------------------------------------------------------------------
  const score = scoreLikert(answers);

  let severity = 'unknown';
  if (type === 'phq9') severity = interpretPHQ9(score);
  if (type === 'gad7') severity = interpretGAD7(score);
  if (type === 'pss10') severity = interpretPSS10(score);
  if (type === 'burnout') severity = interpretBurnout(score);

  // ---------------------------------------------------------------------------
  // Analytics (aggregate only, privacy-safe)
  // ---------------------------------------------------------------------------
  trackAssessment(type, severity);

  // ---------------------------------------------------------------------------
  // Authenticated user identity (JWT / Google OAuth)
  // ---------------------------------------------------------------------------
  const userId = req.user.userId;

  const summary = {
    assessment: type,
    score,
    severity,
    submittedAt: Date.now()
  };

  // ---------------------------------------------------------------------------
  // Persist assessment summary
  // ---------------------------------------------------------------------------
  saveLatestAssessment(userId, summary);

  // ---------------------------------------------------------------------------
  // ✅ STEP 7.2 — Store severity for AI behavior adaptation
  // ---------------------------------------------------------------------------
  setUserSeverity(userId, type, severity);

  res.json({
    ...summary,
    message: 'Assessment submitted successfully'
  });
});

// -----------------------------------------------------------------------------
// GET /assessments/latest
// Returns latest assessment summary for the user
// -----------------------------------------------------------------------------
router.get('/latest', (req, res) => {
  const userId = req.user.userId;
  const latest = getLatestAssessment(userId);

  if (!latest) {
    return res.json({ exists: false });
  }

  res.json({
    exists: true,
    ...latest
  });
});

export default router;
