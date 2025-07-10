import express from 'express';
import { getAuthUrl, exchangeCodeForTokens, generateJWT, verifyJWT, authenticateToken, AuthenticatedRequest } from '../auth/oauth';

const router = express.Router();

/**
 * GET /auth/google
 * Get Google OAuth URL for frontend redirect
 */
router.get('/google', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({
      success: true,
      data: {
        authUrl,
        message: 'Redirect to this URL to authenticate with Google'
      }
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authentication URL',
      code: 'AUTH_URL_ERROR'
    });
  }
});

/**
 * POST /auth/google/callback
 * Handle OAuth callback and exchange code for tokens
 */
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      res.status(400).json({
        success: false,
        error: 'Authorization code is required',
        code: 'CODE_REQUIRED'
      });
      return;
    }

    // Exchange code for user info
    const user = await exchangeCodeForTokens(code);
    
    // Generate JWT token
    const token = generateJWT(user);
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          verified_email: user.verified_email
        },
        expiresIn: process.env.JWT_EXPIRY || '24h'
      }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
});

/**
 * GET /auth/google/callback
 * Handle OAuth callback from Google redirect
 */
router.get('/google/callback', async (req, res) => {
  try {
    console.log('OAuth callback received:', {
      query: req.query,
      headers: req.headers,
      url: req.url
    });
    
    const { code, error } = req.query;
    
    if (error) {
      console.error('OAuth error received from Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}?error=oauth_error&message=${encodeURIComponent(error as string)}`;
      console.log('Redirecting to frontend with error:', redirectUrl);
      res.redirect(redirectUrl);
      return;
    }
    
    if (!code) {
      console.error('No authorization code received');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}?error=no_code`;
      console.log('Redirecting to frontend with no_code error:', redirectUrl);
      res.redirect(redirectUrl);
      return;
    }

    console.log('Exchanging code for tokens...');
    // Exchange code for user info
    const user = await exchangeCodeForTokens(code as string);
    console.log('User info received:', {
      id: user.id,
      email: user.email,
      name: user.name,
      verified_email: user.verified_email
    });
    
    // Generate JWT token
    const token = generateJWT(user);
    console.log('JWT token generated, length:', token.length);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userJson = JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      verified_email: user.verified_email
    });
    const redirectUrl = `${frontendUrl}?token=${token}&user=${encodeURIComponent(userJson)}`;
    console.log('Redirecting to frontend with success:', {
      frontendUrl,
      tokenLength: token.length,
      userEmail: user.email,
      redirectUrlLength: redirectUrl.length
    });
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}?error=auth_failed`;
    console.log('Redirecting to frontend with auth_failed error:', redirectUrl);
    res.redirect(redirectUrl);
  }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken as any, (req: any, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * POST /auth/verify
 * Verify token validity
 */
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Token is required',
        code: 'TOKEN_REQUIRED'
      });
      return;
    }

    const user = verifyJWT(token);
    
    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          verified_email: user.verified_email
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      data: {
        valid: false
      },
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // Since we're using JWT tokens, logout is handled client-side by removing the token
  // We could implement a token blacklist here if needed
  res.json({
    success: true,
    data: {
      message: 'Logged out successfully'
    }
  });
});

export default router;
