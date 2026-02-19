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

    let googleUser;

    // Check for simulation/demo token
    if (idToken.startsWith('mock_google_token_')) {
      console.log("Using mock Google token for demo");
      googleUser = {
        googleId: "mock_gh_" + idToken.split('_')[3], // Generate ID from timestamp
        email: `demo_user_${idToken.split('_')[3]}@example.com`,
        name: "Demo User",
        picture: "https://lh3.googleusercontent.com/a/default-user"
      };
    } else {
      // Real verification
      googleUser = await verifyGoogleToken(idToken);
    }

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

// GitHub Login Endpoint
router.post('/github', async (req, res, next) => {
  try {
    const { code } = req.body;

    // Exchange code for token
    // In a real app, you'd use axios to call GitHub API here with CLIENT_ID and CLIENT_SECRET
    // For now, we'll simulate a successful GitHub login if we receive a valid-looking code
    // OR we can implement the real thing if env vars are present.

    let githubUser;

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      // Real implementation would go here
      // For this demo, we will fall back to simulation because we likely don't have the keys yet
      throw new Error("GitHub keys not configured in backend");
    } else {
      // Simulation for demo purposes
      // In production, this MUST be replaced with real OAuth validation
      if (!code) throw new Error("No code provided");

      githubUser = {
        githubId: "gh_" + Math.random().toString(36).substr(2, 9),
        email: `github_user_${Date.now()}@example.com`,
        name: "GitHub User",
        picture: "https://github.com/github.png"
      };
    }

    let user = await User.findOne({ email: githubUser.email });

    if (!user) {
      user = new User({
        googleId: githubUser.githubId, // reusing field or add new one
        name: githubUser.name,
        email: githubUser.email,
        picture: githubUser.picture,
        bio: 'Open source enthusiast. 💻',
        role: 'Member'
      });
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
