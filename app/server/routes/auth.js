/**
 * scheduleWebApp/app/server/routes/auth.js
 */

const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;
    const user = await authService.login(user_id, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = user;
    return res.json({ message: 'ok', user });
  } catch (err) {
    console.error('auth login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ message: 'ok' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json(req.session.user);
});

module.exports = router;
