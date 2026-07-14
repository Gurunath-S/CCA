const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ profile });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  const { ageGroup, theme } = req.body;

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: {
        ageGroup,
        theme
      },
      create: {
        userId: req.user.id,
        ageGroup,
        theme
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
