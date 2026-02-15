// src/routes/auth.js

import { Router } from 'express';
import { z } from 'zod';
import { verifyGoogleToken } from '../services/auth.js';
import { signToken, verifyToken } from '../services/jwt.js';

const router = Router();

// In-memory data store for development
// In a real app, this would be a database
const users = [];

const schema = z.object({
  idToken: z.string().min(10)
});

// Middleware to verify token and attach user to request
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtToken = signToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      token: jwtToken,
      user: { ...user, password: undefined } // Exclude password from response
    });
  } catch (err) {
    next(err);
  }
});

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, location, bio, role, hobbies, likes, dislikes, contact_name, contact_phone } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email,
      password, // In a real app, hash this!
      location: location || '',
      bio: bio || 'Taking it one day at a time. 🌱',
      role: role || 'Member',
      hobbies: hobbies || [],
      likes: likes || [],
      dislikes: dislikes || [],
      contact_name: contact_name || '',
      contact_phone: contact_phone || ''
    };

    users.push(newUser);

    const jwtToken = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

    res.json({
      token: jwtToken,
      user: { ...newUser, password: undefined }
    });
  } catch (err) {
    next(err);
  }
});

// Get Profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ ...req.user, password: undefined });
});

// Update Profile
router.post('/profile', authenticate, (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'location', 'bio', 'role', 'hobbies', 'likes', 'dislikes', 'contact_name', 'contact_phone'];

    // Update user object in memory
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        req.user[key] = updates[key];
      }
    });

    // Update token if name changed (optional, but good practice if token contains name)
    const jwtToken = signToken({
      userId: req.user.id,
      email: req.user.email,
      name: req.user.name
    });

    res.json({
      success: true,
      user: { ...req.user, password: undefined },
      token: jwtToken // Send back new token in case name changed
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = schema.parse(req.body);

    const googleUser = await verifyGoogleToken(idToken);

    let user = users.find(u => u.email === googleUser.email);

    if (!user) {
      user = {
        id: googleUser.googleId || 'google-' + Date.now(),
        name: googleUser.name,
        email: googleUser.email,
        location: '',
        bio: 'Taking it one day at a time. 🌱',
        role: 'Member',
        hobbies: [],
        likes: [],
        dislikes: [],
        contact_name: '',
        contact_phone: '',
        picture: googleUser.picture
      };
      users.push(user);
    }

    const jwtToken = signToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      token: jwtToken,
      user: { ...user, password: undefined }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
