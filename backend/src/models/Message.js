// backend/src/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system']
    },
    content: {
        type: String,
        required: true
    },
    isCrisis: {
        type: Number, // 0 or 1 for simple boolean/flag
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient history retrieval
messageSchema.index({ userId: 1, timestamp: -1 });

export const Message = mongoose.model('Message', messageSchema);
