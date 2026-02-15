// src/services/analytics.js
// Privacy-first, aggregate-only analytics store

const analytics = {
  chats: {
    total: 0,
    crisis: 0
  },
  assessments: {},
  actions: {}
};

// --------------------
// CHAT ANALYTICS
// --------------------
export function trackChat() {
  analytics.chats.total += 1;
}

export function trackCrisis() {
  analytics.chats.crisis += 1;
}

// --------------------
// ASSESSMENT ANALYTICS
// --------------------
export function trackAssessment(type, severity) {
  if (!analytics.assessments[type]) {
    analytics.assessments[type] = {};
  }

  if (!analytics.assessments[type][severity]) {
    analytics.assessments[type][severity] = 0;
  }

  analytics.assessments[type][severity] += 1;
}

// --------------------
// QUICK ACTION ANALYTICS (optional, future-ready)
// --------------------
export function trackAction(action) {
  if (!analytics.actions[action]) {
    analytics.actions[action] = 0;
  }
  analytics.actions[action] += 1;
}

// --------------------
// READ-ONLY EXPORT
// --------------------
export function getAnalytics() {
  return analytics;
}
