// src/routes/auth.js

import { Router } from 'express';
import { z } from 'zod';
import { verifyGoogleToken } from '../services/auth.js';
import { signToken, verifyToken } from '../services/jwt.js';
import { User } from '../models/User.js';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  location: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional()
});

const googleSchema = z.object({
  idToken: z.string().min(10)
});

// Middleware to verify token and attach user to request
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      ...user.toObject(),
      id: user._id.toString() // Compatible with old code expecting .id
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    });

    res.json({
      token: jwtToken,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    next(err);
  }
});

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = new User({
      ...data,
      password: data.password // In production, hash this!
    });

    await newUser.save();

    const jwtToken = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name
    });

    res.json({
      token: jwtToken,
      user: { ...newUser.toObject(), password: undefined }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

// Get Profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ ...req.user, password: undefined });
});

// Update Profile
router.post('/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'location', 'bio', 'role', 'hobbies', 'likes', 'dislikes', 'contact_name', 'contact_phone'];
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    // Update token if name changed
    const jwtToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    });

    res.json({
      success: true,
      user: { ...user.toObject(), password: undefined },
      token: jwtToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = googleSchema.parse(req.body);

    const googleUser = await verifyGoogleToken(idToken);

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = new User({
        googleId: googleUser.googleId,
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        bio: 'Taking it one day at a time. 🌱',
        role: 'Member'
      });
      await user.save();
    } else if (!user.googleId) {
      // Link google account to existing email user
      user.googleId = googleUser.googleId;
      user.picture = googleUser.picture || user.picture;
      await user.save();
    }

    const jwtToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    });

    res.json({
      token: jwtToken,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
