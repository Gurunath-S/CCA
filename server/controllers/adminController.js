const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List all users with basic metadata, usage metrics and filtering
exports.getUsers = async (req, res) => {
  const { search, ageGroup } = req.query;

  try {
    // Build query conditions
    const whereConditions = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (ageGroup && ageGroup !== 'All') {
      whereConditions.profile = {
        ageGroup: ageGroup
      };
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            ageGroup: true,
            theme: true
          }
        },
        _count: {
          select: {
            assessments: true,
            notes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error('getUsers admin error:', err);
    res.status(500).json({ message: 'Server error fetching users list' });
  }
};

// Get details of a single user (including filtered assessments and notes)
exports.getUserDetail = async (req, res) => {
  const { userId } = req.params;
  const { category, minScore } = req.query;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            ageGroup: true,
            theme: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build assessment filter
    const assessmentWhere = { userId };
    if (category && category !== 'All') {
      assessmentWhere.character = {
        category: category
      };
    }
    if (minScore) {
      assessmentWhere.alignmentScore = {
        gte: parseInt(minScore, 10)
      };
    }

    const assessments = await prisma.assessment.findMany({
      where: assessmentWhere,
      include: {
        character: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: { assessmentDate: 'desc' }
    });

    const notes = await prisma.personalNote.findMany({
      where: { userId },
      include: {
        character: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      user,
      assessments,
      notes
    });
  } catch (err) {
    console.error('getUserDetail admin error:', err);
    res.status(500).json({ message: 'Server error retrieving user details' });
  }
};

// Create a new global character attribute
exports.createGlobalAttribute = async (req, res) => {
  const { name, description, category } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Attribute name is required' });
  }

  try {
    // Check if character already exists globally
    const existingAttr = await prisma.characterAttribute.findFirst({
      where: {
        name: name.trim(),
        userId: null
      }
    });

    if (existingAttr) {
      return res.status(400).json({ message: 'A global attribute with this name already exists' });
    }

    const newAttr = await prisma.characterAttribute.create({
      data: {
        name: name.trim(),
        description: description || '',
        category: category || 'General',
        isCustom: false,
        userId: null
      }
    });

    res.status(201).json({
      message: 'Global character attribute created successfully',
      character: newAttr
    });
  } catch (err) {
    console.error('createGlobalAttribute admin error:', err);
    res.status(500).json({ message: 'Failed to create global character attribute' });
  }
};
