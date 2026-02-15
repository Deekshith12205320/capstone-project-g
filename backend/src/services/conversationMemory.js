// backend/src/services/conversationMemory.js
import { Message } from '../models/Message.js';

const MAX_CONTEXT_MESSAGES = 10; // Number of messages to feed into LLM context

// Add a message to the database
export async function addMessage(userId, role, content) {
  try {
    const newMessage = new Message({
      userId,
      role,
      content,
      isCrisis: 0 // Default, can be updated if crisis detected
    });
    await newMessage.save();
  } catch (err) {
    console.error('Error saving message to DB:', err);
  }
}

// Get short-term context for the LLM (last N messages)
export async function getConversationContext(userId) {
  try {
    const messages = await Message.find({ userId })
      .sort({ timestamp: -1 })
      .limit(MAX_CONTEXT_MESSAGES)
      .lean();

    // Reverse to chronological order for the LLM
    return messages
      .reverse()
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  } catch (err) {
    console.error('Error fetching conversation context:', err);
    return '';
  }
}

// Get full history for the Frontend UI (with pagination limit if needed)
export async function getHistory(userId) {
  try {
    const messages = await Message.find({ userId })
      .sort({ timestamp: 1 }) // Chronological order for UI
      .limit(100) // Safety limit
      .lean();

    return messages.map(m => ({
      id: m._id.toString(),
      role: m.role === 'assistant' ? 'ai' : m.role, // Map 'assistant' -> 'ai'
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      is_crisis: m.isCrisis || 0
    }));
  } catch (err) {
    console.error('Error fetching history:', err);
    return [];
  }
}

// Clear history for a user
export async function clearHistory(userId) {
  try {
    await Message.deleteMany({ userId });
  } catch (err) {
    console.error('Error clearing history:', err);
  }
}
