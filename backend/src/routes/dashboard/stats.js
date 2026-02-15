// backend/src/routes/dashboard/stats.js
import { Router } from 'express';
import { AssessmentResult } from '../../models/AssessmentResult.js';

const router = Router();

// GET /dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Calculate Days Active (unique days with assessments)
        // For simplicity, we'll based it on assessments. 
        // Ideally, we'd also track login/chat days.
        const allAssessments = await AssessmentResult.find({ userId }).select('timestamp score severity type').lean();

        const uniqueDays = new Set(
            allAssessments.map(a => a.timestamp.toISOString().split('T')[0])
        );
        const daysActive = uniqueDays.size || 1; // Default to 1 for new user

        // 2. Calculate Average Mood Score (normalized 0-100 if needed, or raw)
        // Assuming scores are comparable or we just average them raw for now.
        // PSS-10 (0-40), GAD-7 (0-21), PHQ-9 (0-27). 
        // Let's normalize to 0-100 for "Mood" display where High Score = Low Mood usually.
        // BUT user wants "Mood", usually 100 is Good.
        // High Stress/Depp = Bad Mood.
        // Let's invert: Mood = 100 - (Normalized Badness).

        let totalNormalizedBadness = 0;
        let count = 0;

        allAssessments.forEach(a => {
            let maxScore = 40; // Default PSS-10
            if (a.type === 'gad7') maxScore = 21;
            if (a.type === 'phq9') maxScore = 27;
            if (a.type === 'burnout') maxScore = 60; // Approx

            const normalized = (a.score / maxScore) * 100;
            totalNormalizedBadness += normalized;
            count++;
        });

        const avgBadness = count > 0 ? totalNormalizedBadness / count : 0;
        const avgMood = Math.round(100 - avgBadness); // 100 = Perfect, 0 = Worst

        // 3. Mood Flow Data (Last 7 days)
        const history = allAssessments
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(a => ({
                date: a.timestamp.toISOString().split('T')[0],
                score: a.score, // Raw score
                type: a.type,
                severity: a.severity
            }));

        res.json({
            daysActive,
            avgMood,
            history,
            totalAssessments: count
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
