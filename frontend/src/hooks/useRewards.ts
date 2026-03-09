import { useState, useEffect } from 'react';

export interface RewardBadge {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: number | null;
}

export interface UserStats {
    totalQuestsCompleted: number;
    currentStreak: number;
    lastActiveDate: string | null;
    level: number;
    xp: number;
}

// Initial Badges
const DEFAULT_BADGES: RewardBadge[] = [
    { id: 'first_quest', title: 'First Steps', description: 'Complete your first mental fitness quest', icon: '🌟', unlockedAt: null },
    { id: 'streak_3', title: 'Consistency Key', description: 'Maintain a 3-day quest streak', icon: '🔥', unlockedAt: null },
    { id: 'zen_master', title: 'Zen Master', description: 'Complete 10 breathing exercises', icon: '🌬️', unlockedAt: null },
    { id: 'flow_state', title: 'Flow State', description: 'Reach 1,000 points in Tetris', icon: '🧩', unlockedAt: null },
    { id: 'writer', title: 'Deep Thinker', description: 'Complete 5 journaling sessions', icon: '✍️', unlockedAt: null },
];

export function useRewards() {
    const [stats, setStats] = useState<UserStats>({
        totalQuestsCompleted: 0,
        currentStreak: 0,
        lastActiveDate: null,
        level: 1,
        xp: 0
    });

    const [badges, setBadges] = useState<RewardBadge[]>(DEFAULT_BADGES);

    // Load from local storage
    useEffect(() => {
        const storedStats = localStorage.getItem('vista_stats');
        const storedBadges = localStorage.getItem('vista_badges');

        if (storedStats) setStats(JSON.parse(storedStats));
        if (storedBadges) setBadges(JSON.parse(storedBadges));
    }, []);

    // Save to local storage whenever they change
    const saveState = (newStats: UserStats, newBadges: RewardBadge[]) => {
        setStats(newStats);
        setBadges(newBadges);
        localStorage.setItem('vista_stats', JSON.stringify(newStats));
        localStorage.setItem('vista_badges', JSON.stringify(newBadges));
    };

    const addXP = (amount: number) => {
        const newStats = { ...stats };
        newStats.xp += amount;

        // Level up logic (every 100 XP = 1 level)
        if (newStats.xp >= newStats.level * 100) {
            newStats.level += 1;
            // Optionally, trigger a level up notification here
        }

        saveState(newStats, badges);
    };

    const unlockBadge = (badgeId: string) => {
        const badgeIndex = badges.findIndex(b => b.id === badgeId);
        if (badgeIndex !== -1 && !badges[badgeIndex].unlockedAt) {
            const newBadges = [...badges];
            newBadges[badgeIndex].unlockedAt = Date.now();
            saveState(stats, newBadges);
            return true; // Indicates a new unlock happened
        }
        return false;
    };

    const completeQuest = (questId: string, scoreParams?: any) => {
        const today = new Date().toISOString().split('T')[0];
        const newStats = { ...stats };

        // Handle Streaks
        if (newStats.lastActiveDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (newStats.lastActiveDate === yesterday.toISOString().split('T')[0]) {
                newStats.currentStreak += 1;
            } else {
                newStats.currentStreak = 1; // Reset streak
            }
            newStats.lastActiveDate = today;
        }

        newStats.totalQuestsCompleted += 1;

        // Save stats immediately so badge checks have latest data
        saveState(newStats, badges);
        addXP(20); // Base XP for completing any quest

        // Check for specific badge unlocks
        if (newStats.totalQuestsCompleted === 1) {
            unlockBadge('first_quest');
        }

        if (newStats.currentStreak >= 3) {
            unlockBadge('streak_3');
        }

        if (questId === 'tetris' && scoreParams?.score >= 1000) {
            unlockBadge('flow_state');
        }

        // Return updated stats for UI
        return newStats;
    };

    return {
        stats,
        badges,
        completeQuest,
        addXP,
        unlockedBadgesCount: badges.filter(b => b.unlockedAt !== null).length
    };
}
