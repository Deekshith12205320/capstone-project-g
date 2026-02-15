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
