// src/services/scoring.js

export function scoreLikert(answers = []) {
  return answers.reduce((sum, v) => sum + Number(v), 0);
}

// ---------- PHQ-9 ----------
export function interpretPHQ9(score) {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  if (score <= 19) return 'moderately_severe';
  return 'severe';
}

// ---------- GAD-7 ----------
export function interpretGAD7(score) {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  return 'severe';
}

// ---------- PSS-10 ----------
export function interpretPSS10(score) {
  if (score <= 13) return 'low';
  if (score <= 26) return 'moderate';
  return 'high';
}

// ---------- Burnout ----------
export function interpretBurnout(score) {
  if (score <= 33) return 'low';
  if (score <= 66) return 'moderate';
  return 'high';
}
