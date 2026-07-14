const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create new assessment
exports.createAssessment = async (req, res) => {
  const {
    characterId,
    assessmentDate,
    alignmentScore,
    othersRecognize,
    consciousEffort,
    effortLevel,
    practiceFrequency,
    personalNote
  } = req.body;

  const userId = req.user.id;

  if (!characterId || !alignmentScore) {
    return res.status(400).json({ message: 'Character ID and Alignment Score are required' });
  }

  try {
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        characterId,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date(),
        alignmentScore: parseInt(alignmentScore, 10),
        othersRecognize: othersRecognize || 'No - Not at all',
        consciousEffort: consciousEffort === true || consciousEffort === 'true' || consciousEffort === 'Yes',
        effortLevel: effortLevel || 'I am aware of this trait in my action but hard to practice',
        practiceFrequency: practiceFrequency || 'Didn’t get to practice this',
        personalNote: personalNote || null
      }
    });

    res.status(201).json({
      message: 'Assessment submitted successfully',
      assessment
    });
  } catch (err) {
    console.error('createAssessment error:', err);
    res.status(500).json({ message: 'Failed to save assessment' });
  }
};

// Get all assessments for current user (history)
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await prisma.assessment.findMany({
      where: { userId },
      include: {
        character: {
          select: { name: true, category: true }
        }
      },
      orderBy: { assessmentDate: 'desc' }
    });

    res.status(200).json({ history });
  } catch (err) {
    console.error('getHistory error:', err);
    res.status(500).json({ message: 'Server error retrieving assessment history' });
  }
};

// Get assessments for a specific character
exports.getAssessmentsByCharacter = async (req, res) => {
  const { characterId } = req.params;
  const userId = req.user.id;

  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        userId,
        characterId
      },
      orderBy: { assessmentDate: 'desc' }
    });

    res.status(200).json({ assessments });
  } catch (err) {
    console.error('getAssessmentsByCharacter error:', err);
    res.status(500).json({ message: 'Server error retrieving character assessments' });
  }
};

// Get aggregate stats for a character
exports.getAggregateStats = async (req, res) => {
  const { characterId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Fetch user's latest assessment for this character
    const userAssessments = await prisma.assessment.findMany({
      where: { userId, characterId },
      orderBy: { assessmentDate: 'desc' }
    });

    const userLatestScore = userAssessments.length > 0 ? userAssessments[0].alignmentScore : null;

    // 2. Compute community average for this character
    const communityAverageResult = await prisma.assessment.aggregate({
      where: { characterId },
      _avg: { alignmentScore: true },
      _count: { id: true }
    });

    const communityAverage = communityAverageResult._avg.alignmentScore
      ? parseFloat(communityAverageResult._avg.alignmentScore.toFixed(2))
      : 0;

    const communityResponseCount = communityAverageResult._count.id;

    // 3. Get response distributions for the community
    const allAssessmentsForCharacter = await prisma.assessment.findMany({
      where: { characterId },
      select: {
        alignmentScore: true,
        othersRecognize: true,
        consciousEffort: true,
        practiceFrequency: true
      }
    });

    // Initialize distribution counters
    const alignmentDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const recognitionDistribution = {
      'Yes - Regularly': 0,
      'Yes - Sometimes': 0,
      'No - Not at all': 0,
      'Others remind me for not having this trait': 0
    };
    const effortDistribution = { 'Yes': 0, 'No': 0 };
    const frequencyDistribution = {
      'Didn’t get to practice this': 0,
      '1 - 5 times': 0,
      'More than 5 times': 0
    };

    allAssessmentsForCharacter.forEach(a => {
      // Alignment
      if (alignmentDistribution[a.alignmentScore] !== undefined) {
        alignmentDistribution[a.alignmentScore]++;
      }
      
      // Recognition (normalize options if needed, but we keep exact text matches)
      const rec = a.othersRecognize;
      if (recognitionDistribution[rec] !== undefined) {
        recognitionDistribution[rec]++;
      } else {
        // Fallback checks for older or alternative spellings
        if (rec.includes('Regularly')) recognitionDistribution['Yes - Regularly']++;
        else if (rec.includes('Sometimes')) recognitionDistribution['Yes - Sometimes']++;
        else if (rec.includes('Not at all')) recognitionDistribution['No - Not at all']++;
        else if (rec.includes('remind')) recognitionDistribution['Others remind me for not having this trait']++;
      }

      // Effort
      const effort = a.consciousEffort ? 'Yes' : 'No';
      effortDistribution[effort]++;

      // Frequency
      const freq = a.practiceFrequency;
      if (frequencyDistribution[freq] !== undefined) {
        frequencyDistribution[freq]++;
      } else {
        if (freq.includes('Didn') || freq.includes('get to')) frequencyDistribution['Didn’t get to practice this']++;
        else if (freq.includes('1 - 5') || freq.includes('1–5')) frequencyDistribution['1 - 5 times']++;
        else if (freq.includes('More than 5') || freq.includes('5')) frequencyDistribution['More than 5 times']++;
      }
    });

    // Format distributions as arrays for Recharts
    const alignmentChartData = Object.keys(alignmentDistribution).map(score => ({
      score: `Level ${score}`,
      count: alignmentDistribution[score]
    }));

    const recognitionChartData = Object.keys(recognitionDistribution).map(option => ({
      option,
      count: recognitionDistribution[option]
    }));

    const effortChartData = Object.keys(effortDistribution).map(option => ({
      option,
      count: effortDistribution[option]
    }));

    const frequencyChartData = Object.keys(frequencyDistribution).map(option => ({
      option,
      count: frequencyDistribution[option]
    }));

    res.status(200).json({
      userLatestScore,
      userTotalAssessments: userAssessments.length,
      communityAverage,
      communityResponseCount,
      distributions: {
        alignment: alignmentChartData,
        recognition: recognitionChartData,
        effort: effortChartData,
        frequency: frequencyChartData
      }
    });
  } catch (err) {
    console.error('getAggregateStats error:', err);
    res.status(500).json({ message: 'Server error retrieving aggregate statistics' });
  }
};
