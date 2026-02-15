// backend/src/services/journalStore.js
import { JournalEntry } from '../models/JournalEntry.js';

/**
 * Save a new journal entry
 */
export async function createJournalEntry(userId, data) {
    try {
        const entry = new JournalEntry({
            userId,
            title: data.title,
            content: data.content,
            mood: data.mood,
            tags: data.tags || []
        });
        await entry.save();
        return entry;
    } catch (err) {
        console.error('Error creating journal entry:', err);
        throw err;
    }
}

/**
 * Get journal history for a user
 */
export async function getJournalHistory(userId) {
    try {
        const entries = await JournalEntry.find({ userId })
            .sort({ timestamp: -1 }) // Newest first
            .limit(50) // Limit to last 50 entries for now
            .lean();

        return entries.map(e => ({
            id: e._id.toString(),
            title: e.title,
            content: e.content,
            date: e.timestamp.toISOString(),
            mood: e.mood,
            tags: e.tags
        }));
    } catch (err) {
        console.error('Error fetching journal history:', err);
        return [];
    }
}
