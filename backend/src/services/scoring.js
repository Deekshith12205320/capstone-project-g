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

// ---------- Daily Wellbeing Check-in ----------
// Score range: 0-35 (sum of all values)
// Higher score = better wellbeing
export function interpretDaily(score) {
  // Invert scoring: higher is better for daily check-in
  const percentage = (score / 35) * 100;

  if (percentage >= 70) return 'excellent';   // 25-35: Thriving
  if (percentage >= 50) return 'good';        // 17-24: Managing well
  if (percentage >= 30) return 'fair';        // 11-16: Some struggles
  return 'concerning';                         // 0-10: Need support
}
