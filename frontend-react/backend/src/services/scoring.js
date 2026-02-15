export function scoreAssessment(type, answers) {
  return Object.values(answers).reduce((sum, val) => sum + val, 0);
}

export function categorizeScore(type, score) {
  switch (type) {
    case 'phq9':
      if (score <= 4) return 'minimal';
      if (score <= 9) return 'mild';
      if (score <= 14) return 'moderate';
      if (score <= 19) return 'moderately severe';
      return 'severe';

    case 'gad7':
      if (score <= 4) return 'minimal';
      if (score <= 9) return 'mild';
      if (score <= 14) return 'moderate';
      return 'severe';

    case 'pss10':
      if (score <= 13) return 'low';
      if (score <= 26) return 'moderate';
      return 'high';

    case 'burnout':
      if (score <= 30) return 'low';
      if (score <= 60) return 'moderate';
      return 'high';

    default:
      return 'unknown';
  }
}
