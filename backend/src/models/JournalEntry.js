// backend/src/models/JournalEntry.js
import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: false,
        default: 'Untitled'
    },
    content: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        default: 'Neutral'
    },
    tags: [String],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for retrieving history efficiently
journalEntrySchema.index({ userId: 1, timestamp: -1 });

export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
