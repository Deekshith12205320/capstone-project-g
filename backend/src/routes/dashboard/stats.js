// backend/src/routes/dashboard/stats.js
import { Router } from 'express';
import { AssessmentResult } from '../../models/AssessmentResult.js';
import { User } from '../../models/User.js';

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

// POST /dashboard/game-score
router.post('/game-score', async (req, res) => {
    try {
        const { game, score } = req.body;
        if (!score || score <= 0) return res.json({ ignored: true });

        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.progress = (user.progress || 0) + score;
        let earnedCoins = Math.floor(score / 50); // 1 coin per 50 score

        // leveling logic
        let leveledUp = false;
        let threshold = (user.level || 1) * 1000;

        while (user.progress >= threshold) {
            user.level = (user.level || 1) + 1;
            user.progress = user.progress - threshold;
            earnedCoins += 50; // Bonus coins for leveling up
            leveledUp = true;
            threshold = user.level * 1000;
        }

        user.coins = (user.coins || 0) + earnedCoins;
        await user.save();

        res.json({
            earnedCoins,
            totalCoins: user.coins,
            level: user.level,
            progress: user.progress,
            leveledUp
        });
    } catch (err) {
        console.error('Error saving game score:', err);
        res.status(500).json({ error: 'Failed to save game score' });
    }
});

export default router;
