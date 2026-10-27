import express from 'express';
import { 
  authenticateUser, 
  registerUser, 
  generateToken, 
  authenticateToken, 
  listUsers 
} from '../auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = registerUser(username, password, name);
    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    if (error.message === 'Username already exists') {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

/**
 * GET /api/auth/users (authenticated users only)
 */
router.get('/users', authenticateToken, (req, res) => {
  res.json({
    users: listUsers()
  });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
