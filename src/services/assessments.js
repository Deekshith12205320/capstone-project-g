// src/services/assessments.js

import phq9 from '../data/phq9.json' with { type: 'json' };
import gad7 from '../data/gad7.json' with { type: 'json' };
import pss10 from '../data/pss10.json' with { type: 'json' };
import burnout from '../data/cbi_burnout.json' with { type: 'json' };

const ASSESSMENTS = {
  phq9,
  gad7,
  pss10,
  burnout
};

export function listAssessments() {
  return Object.values(ASSESSMENTS).map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    itemsCount: a.items.length
  }));
}

export function getAssessment(type) {
  return ASSESSMENTS[type] || null;
}
