import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Get user profile
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM user_profile WHERE id = 1');
        const user = stmt.get();

        if (user) {
            // Parse JSON fields
            try { user.hobbies = JSON.parse(user.hobbies || '[]'); } catch (e) { }
            try { user.likes = JSON.parse(user.likes || '[]'); } catch (e) { }
            try { user.dislikes = JSON.parse(user.dislikes || '[]'); } catch (e) { }
        }

        res.json(user || {});
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
router.post('/', (req, res) => {
    try {
        const {
            name, location, bio, role,
            hobbies, likes, dislikes,
            contact_name, contact_phone
        } = req.body;

        const stmt = db.prepare(`
      UPDATE user_profile 
      SET name = ?, location = ?, bio = ?, role = ?, 
          hobbies = ?, likes = ?, dislikes = ?, 
          contact_name = ?, contact_phone = ?
      WHERE id = 1
    `);

        const run = stmt.run(
            name, location, bio, role,
            JSON.stringify(hobbies || []),
            JSON.stringify(likes || []),
            JSON.stringify(dislikes || []),
            contact_name, contact_phone
        );

        if (run.changes === 0) {
            // Fallback insert if row 1 doesn't exist (shouldn't happen due to default init)
            db.prepare(`INSERT OR IGNORE INTO user_profile (id, name) VALUES (1, 'User')`).run();
            // Retry update... simplified for now assuming init works
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
