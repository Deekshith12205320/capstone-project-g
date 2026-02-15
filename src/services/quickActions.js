// src/services/quickActions.js

const ACTIONS = {
  quick_calm: {
    id: 'quick_calm',
    title: 'Quick Calm',
    description: 'A short grounding exercise to reduce immediate stress.',
    steps: [
      'Sit comfortably and place your feet on the ground.',
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath gently for 2 seconds.',
      'Exhale slowly through your mouth for 6 seconds.',
      'Repeat this cycle 5 times.',
      'Notice one thing you can see, hear, and feel.'
    ]
  },

  journal: {
    id: 'journal',
    title: 'Guided Journaling',
    description: 'Reflective prompts to help you process your thoughts.',
    prompts: [
      'What has been weighing on my mind today?',
      'What emotions did I notice most strongly?',
      'What is one small thing I can do to care for myself right now?',
      'What support would feel helpful at this moment?'
    ]
  },

  ambient: {
    id: 'ambient',
    title: 'Ambient Sounds',
    description: 'Calming background sounds to help you relax or focus.',
    sounds: [
      {
        id: 'rain',
        title: 'Gentle Rain',
        category: 'nature',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_9b1f3c0e40.mp3'
      },
      {
        id: 'ocean',
        title: 'Ocean Waves',
        category: 'nature',
        url: 'https://cdn.pixabay.com/download/audio/2022/10/30/audio_4c4e52e0ad.mp3'
      },
      {
        id: 'forest',
        title: 'Forest Ambience',
        category: 'nature',
        url: 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_57f1d1dfc8.mp3'
      },
      {
        id: 'white_noise',
        title: 'White Noise',
        category: 'focus',
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0b5c4ed6b.mp3'
      }
    ],
    usageTip:
      'Choose one sound, use headphones if possible, and listen for 5–10 minutes while breathing slowly.'
  },

  laughter: {
    id: 'laughter',
    title: 'Laughter Therapy',
    description: 'Light activities to gently lift your mood.',
    activities: [
      'Watch a short funny video or reel.',
      'Recall a moment that made you smile recently.',
      'Smile intentionally for 30 seconds (it can help shift mood).',
      'Share a light moment with someone you trust.'
    ]
  }
};

export function listQuickActions() {
  return Object.values(ACTIONS).map(a => ({
    id: a.id,
    title: a.title,
    description: a.description
  }));
}

export function getQuickAction(actionId) {
  return ACTIONS[actionId] || null;
}
