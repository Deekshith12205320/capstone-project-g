import { Router } from 'express';
import { llmChat } from '../services/llm.js';

const router = Router();

// static menu (used if LLM unavailable)
const library = [
  { id: 'box-breathing', title: 'Box Breathing (4x4x4x4)', steps: [
    'Inhale through nose 4s','Hold 4s','Exhale through mouth 4s','Hold 4s','Repeat 4–6 cycles'
  ]},
  { id: 'grounding-54321', title: 'Grounding 5-4-3-2-1', steps: [
    '5 things you see','4 things you feel','3 things you hear','2 things you smell','1 thing you taste'
  ]},
  { id: 'pmr', title: 'Progressive Muscle Relaxation (mini)', steps: [
    'Tense feet 5s, release','Tense calves 5s, release','Tense thighs 5s, release','Tense shoulders 5s, release'
  ]}
];

router.get('/library', (_req, res) => res.json(library));

router.post('/personalized', async (req, res, next) => {
  try {
    const { feeling, context } = req.body || {};
    const prompt = [
      { role: 'system', content: `You generate short, evidence-based coping plans for students. Return JSON with keys: "headline", "rationale", "steps" (array of 5-7 brief steps), "note". Keep it doable in <8 minutes.` },
      { role: 'user', content: `Feeling: ${feeling || 'unspecified'}\nContext: ${context || 'unspecified'}\nConstraints: quiet place not guaranteed; no equipment.` }
    ];
    const content = await llmChat(prompt, { maxTokens: 450, temperature: 0.6 });
    // try to parse but stay safe
    let plan;
    try { plan = JSON.parse(content); }
    catch { plan = { headline: 'Quick reset', rationale: 'Short, portable routine', steps: library[0].steps, note: 'If symptoms worsen or you feel unsafe, seek immediate help.'}; }
    res.json(plan);
  } catch (e) { next(e); }
});

export default router;
