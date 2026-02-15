// src/services/assessmentStore.js

// In-memory store (DB-ready abstraction)
const latestAssessmentByUser = new Map();

/**
 * Save latest assessment summary for a user
 */
export function saveLatestAssessment(userId, summary) {
  latestAssessmentByUser.set(userId, {
    ...summary,
    savedAt: new Date().toISOString()
  });
}

/**
 * Get latest assessment summary for a user
 */
export function getLatestAssessment(userId) {
  return latestAssessmentByUser.get(userId) || null;
}
