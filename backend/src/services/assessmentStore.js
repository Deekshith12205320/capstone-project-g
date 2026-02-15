// backend/src/services/assessmentStore.js
import { AssessmentResult } from '../models/AssessmentResult.js';

/**
 * Save latest assessment summary for a user
 */
export async function saveLatestAssessment(userId, summary) {
  try {
    const result = new AssessmentResult({
      userId,
      type: summary.assessment, // Map 'assessment' -> 'type' (legacy naming compat if needed)
      score: summary.score,
      severity: summary.severity,
      answers: [], // We might need to pass answers here if we want to store them
      timestamp: new Date()
    });

    // If summary has answers (it should from the route), use them
    if (summary.answers) {
      result.answers = summary.answers;
    }

    await result.save();
  } catch (err) {
    console.error('Error saving assessment result:', err);
  }
}

/**
 * Get latest assessment summary for a user
 */
export async function getLatestAssessment(userId) {
  try {
    const latest = await AssessmentResult.findOne({ userId })
      .sort({ timestamp: -1 })
      .lean();

    if (!latest) return null;

    return {
      assessment: latest.type,
      score: latest.score,
      severity: latest.severity,
      timestamp: latest.timestamp,
      savedAt: latest.timestamp.toISOString()
    };
  } catch (err) {
    console.error('Error fetching latest assessment:', err);
    return null;
  }
}

/**
 * Get assessment history for mood flow
 */
export async function getAssessmentHistory(userId) {
  try {
    const history = await AssessmentResult.find({ userId })
      .sort({ timestamp: 1 }) // Chronological for graph
      .lean();

    return history.map(h => ({
      date: h.timestamp.toISOString().split('T')[0], // YYYY-MM-DD
      score: h.score,
      severity: h.severity,
      type: h.type
    }));
  } catch (err) {
    console.error('Error fetching assessment history:', err);
    return [];
  }
}
