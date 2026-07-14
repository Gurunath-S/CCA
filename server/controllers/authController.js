const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'supersecretkeycharactercoach2026',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkeycharactercoach2026',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

exports.googleLogin = async (req, res) => {
  const { credential, isMock, email, name, picture } = req.body;

  try {
    let userEmail, userName, userPicture;

    if (isMock || !credential) {
      // Mock Sign In for local development
      if (!email) {
        return res.status(400).json({ message: 'Email is required for mock login' });
      }
      userEmail = email.toLowerCase();
      userName = name || email.split('@')[0];
      userPicture = picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    } else {
      // Google Auth Sign In
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      userEmail = payload.email.toLowerCase();
      userName = payload.name;
      userPicture = payload.picture;
    }

    // Upsert user in database
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { profile: true }
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          picture: userPicture,
          profile: {
            create: {
              theme: 'Serenity'
            }
          }
        },
        include: { profile: true }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    const isFormPost = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (isFormPost) {
      return res.redirect(`${frontendUrl}/login?accessToken=${accessToken}&refreshToken=${refreshToken}&isNewUser=${isNewUser}`);
    }

    res.status(200).json({
      accessToken,
      refreshToken,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        profile: user.profile
      }
    });
  } catch (err) {
    console.error('Google login error:', err);
    const isFormPost = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (isFormPost) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`);
    }
    res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkeycharactercoach2026'
    );

    // Check database to see if token exists and is valid
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.id);

    // Update refresh token in db (rotation)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: {
        token: tokens.refreshToken,
        expiresAt
      }
    });

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        profile: user.profile
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error fetching credentials' });
  }
};
