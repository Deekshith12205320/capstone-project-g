// src/routes/actions.js

import { Router } from 'express';
import {
  listQuickActions,
  getQuickAction
} from '../services/quickActions.js';

const router = Router();

// -----------------------------------------------------------------------------
// GET /actions
// Returns list of available quick actions (for cards)
// -----------------------------------------------------------------------------
router.get('/', (_req, res) => {
  res.json({
    actions: listQuickActions()
  });
});

// -----------------------------------------------------------------------------
// GET /actions/:id
// Returns detailed content for a specific action
// -----------------------------------------------------------------------------
router.get('/:id', (req, res) => {
  const action = getQuickAction(req.params.id);

  if (!action) {
    return res.status(404).json({ error: 'Action not found' });
  }

  res.json(action);
});

export default router;
