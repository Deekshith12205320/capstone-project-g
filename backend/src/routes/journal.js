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
                mood: entry.mood,
                tags: entry.tags
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save journal entry' });
    }
});

// PATCH /journal/:id
// Update an existing journal entry
router.patch('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const entryId = req.params.id;
        const updates = req.body;

        // In a real app, use a service function to handle DB logic and ownership check
        // For now, doing it inline or via service if available. 
        // We'll import JournalEntry model directly here if needed, or use a service.
        // Let's assume we can use the model directly since we are in routes.
        // But wait, we should stick to service pattern if possible. 
        // Let's update journalStore.js as well if needed.
        // For now, I'll access the model via import at top (which isn't imported yet).
        // Checks imports... Yes, line 4 imports createJournalEntry, getJournalHistory.
        // I need to import JournalEntry model or add updateJournalEntry to service.

        // Let's add the route using direct model access for simplicity if the model is exported?
        // No, let's keep it clean. I will assume we add updateJournalEntry to service.
        // BETTER: I will add the route logic here using the model directly IF I import it.
        // BUT I don't have the model imported in routes/journal.js (step 31 check).
        // It only imports services. 

        // I will MODIFY the imports in the next step or use what I have.
        // Actually, step 31 says: import { createJournalEntry, getJournalHistory } from '../services/journalStore.js';
        // I should probably add updateJournalEntry to ../services/journalStore.js first.

        // So this step is: Add PATCH route that calls a new service function `updateJournalEntry`.
        const { updateJournalEntry } = await import('../services/journalStore.js');
        const updatedEntry = await updateJournalEntry(userId, entryId, updates);

        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found or unauthorized' });
        }

        res.json({
            success: true,
            entry: {
                id: updatedEntry._id,
                title: updatedEntry.title,
                content: updatedEntry.content,
                date: updatedEntry.timestamp,
                mood: updatedEntry.mood,
                tags: updatedEntry.tags
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update journal entry' });
    }
});

export default router;
