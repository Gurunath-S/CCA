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
  const { ageGroup, theme, streakType } = req.body;

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: {
        ageGroup,
        theme,
        streakType
      },
      create: {
        userId: req.user.id,
        ageGroup,
        theme,
        streakType
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

exports.exportData = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        customAttributes: true,
        assessments: {
          include: {
            character: true
          }
        },
        notes: {
          include: {
            character: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: user.profile ? {
        ageGroup: user.profile.ageGroup,
        theme: user.profile.theme,
        streakType: user.profile.streakType,
        createdAt: user.profile.createdAt,
      } : null,
      customAttributes: user.customAttributes.map(attr => ({
        name: attr.name,
        category: attr.category,
        description: attr.description,
        createdAt: attr.createdAt,
      })),
      assessments: user.assessments.map(assess => ({
        attributeName: assess.character.name,
        category: assess.character.category,
        assessmentDate: assess.assessmentDate,
        alignmentScore: assess.alignmentScore,
        othersRecognize: assess.othersRecognize,
        consciousEffort: assess.consciousEffort,
        effortLevel: assess.effortLevel,
        practiceFrequency: assess.practiceFrequency,
        personalNote: assess.personalNote,
      })),
      journalNotes: user.notes.map(note => ({
        attributeName: note.character.name,
        content: note.content,
        createdAt: note.createdAt,
      }))
    };

    res.status(200).json(exportPayload);
  } catch (err) {
    console.error('exportData error:', err);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.status(200).json({ message: 'Account and all associated data deleted successfully' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

exports.updateAccount = async (req, res) => {
  const { name, email, picture } = req.body;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate if email is already taken by another user
    if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken by another user' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email.toLowerCase() : undefined,
        picture: picture !== undefined ? picture : undefined
      },
      include: {
        profile: true
      }
    });

    res.status(200).json({
      message: 'Account details updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        picture: updatedUser.picture,
        role: updatedUser.role,
        policyAcknowledged: updatedUser.policyAcknowledged,
        profile: updatedUser.profile
      }
    });
  } catch (err) {
    console.error('updateAccount error:', err);
    res.status(500).json({ message: 'Failed to update account details' });
  }
};
