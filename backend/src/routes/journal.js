// backend/src/routes/journal.js
import { Router } from 'express';
import { z } from 'zod';
import { createJournalEntry, getJournalHistory } from '../services/journalStore.js';

const router = Router();

// Validation schema for creating an entry
const createentrySchema = z.object({
    title: z.string().optional(),
    content: z.string().min(1),
    mood: z.string().optional(),
    tags: z.array(z.string()).optional()
});

// GET /journal
// Retrieve journal history
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const history = await getJournalHistory(userId);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch journal history' });
    }
});

// POST /journal
// Create a new journal entry
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = createentrySchema.parse(req.body);

        const entry = await createJournalEntry(userId, data);

        res.json({
            success: true,
            entry: {
                id: entry._id,
                title: entry.title,
                content: entry.content,
                date: entry.timestamp, // Mongoose date object
                mood: entry.mood
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save journal entry' });
    }
});

export default router;
