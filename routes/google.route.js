const express = require('express');
const passport = require('../config/passport-google'); // Import Google passport strategy

const router = express.Router();

// Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard or any other route
    res.redirect('/dashboard');
  }
);

module.exports = router;
