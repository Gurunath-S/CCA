const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCharacters = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch assessment counts grouped by characterId for this user
    const counts = await prisma.assessment.groupBy({
      by: ['characterId'],
      where: { userId },
      _count: {
        id: true
      }
    });

    const countMap = {};
    counts.forEach(item => {
      countMap[item.characterId] = item._count.id;
    });

    // Fetch global character attributes and user-defined custom attributes (with only the latest assessment row)
    const attributes = await prisma.characterAttribute.findMany({
      where: {
        OR: [
          { userId: null },
          { userId: userId }
        ]
      },
      include: {
        assessments: {
          where: { userId: userId },
          orderBy: { assessmentDate: 'desc' },
          take: 1,
          select: {
            alignmentScore: true,
            assessmentDate: true
          }
        }
      }
    });

    // Format traits with submission count and latest progress
    const formattedAttributes = attributes.map(attr => {
      const submissionCount = countMap[attr.id] || 0;
      const latestAssessment = attr.assessments[0] || null;
      const latestScore = latestAssessment ? latestAssessment.alignmentScore : 0;

      return {
        id: attr.id,
        name: attr.name,
        category: attr.category,
        description: attr.description,
        isCustom: attr.isCustom,
        submissionCount,
        latestScore,
        lastAssessmentDate: latestAssessment ? latestAssessment.assessmentDate : null
      };
    });

    // Sort: 1. Highest submission count first. 2. Alphabetically for remaining.
    formattedAttributes.sort((a, b) => {
      if (b.submissionCount !== a.submissionCount) {
        return b.submissionCount - a.submissionCount;
      }
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({ characters: formattedAttributes });
  } catch (err) {
    console.error('getCharacters error:', err);
    res.status(500).json({ message: 'Server error retrieving character traits' });
  }
};

exports.createCustomCharacter = async (req, res) => {
  const { name, description, category } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Character name is required' });
  }

  try {
    // Check if character already exists for this user (either global or custom)
    const existingAttr = await prisma.characterAttribute.findFirst({
      where: {
        name: name.trim(),
        OR: [
          { userId: null },
          { userId: userId }
        ]
      }
    });

    if (existingAttr) {
      return res.status(400).json({ message: 'A character attribute with this name already exists' });
    }

    const newAttr = await prisma.characterAttribute.create({
      data: {
        name: name.trim(),
        description: description || 'Custom character trait created by you.',
        category: category || 'Custom',
        isCustom: true,
        userId: userId
      }
    });

    res.status(201).json({
      message: 'Custom character attribute created successfully',
      character: {
        ...newAttr,
        submissionCount: 0,
        latestScore: 0,
        lastAssessmentDate: null
      }
    });
  } catch (err) {
    console.error('createCustomCharacter error:', err);
    res.status(500).json({ message: 'Failed to create custom character attribute' });
  }
};
