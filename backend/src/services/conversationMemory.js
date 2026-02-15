// Short-term conversation memory (privacy-safe)

const memory = new Map();

const MAX_MESSAGES = 6; // last 6 turns only
const TTL = 30 * 60 * 1000; // 30 minutes

export function addMessage(userId, role, content) {
  const now = Date.now();
  const convo = memory.get(userId) || [];

  const updated = [
    ...convo.filter(m => now - m.time < TTL),
    { role, content, time: now }
  ].slice(-MAX_MESSAGES);

  memory.set(userId, updated);
}


export function getConversationContext(userId) {
  const convo = memory.get(userId);
  if (!convo || convo.length === 0) return '';

  return convo
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');
}

export function getHistory(userId) {
  const convo = memory.get(userId) || [];
  return convo.map((m, index) => ({
    id: index, // Simple index ID for now
    role: m.role === 'assistant' ? 'ai' : 'user', // Map 'assistant' -> 'ai' for frontend
    content: m.content,
    timestamp: new Date(m.time).toISOString(),
    is_crisis: 0
  }));
}

export function clearHistory(userId) {
  memory.delete(userId);
}
