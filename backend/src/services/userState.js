// In-memory user mental state store (expo-safe)

const userState = new Map();

/**
 * Save latest assessment severity
 */
export function setUserSeverity(userId, assessment, severity) {
  userState.set(userId, {
    assessment,
    severity,
    updatedAt: Date.now()
  });
}

/**
 * Get latest severity
 */
export function getUserSeverity(userId) {
  return userState.get(userId) || null;
}
