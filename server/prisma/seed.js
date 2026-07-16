const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultAttributes = [
  // Niyama
  { name: 'Cleanliness (Saucha - Niyama)', category: 'Niyama', description: 'Purity of body, mind, and environment.' },
  { name: 'Contentment (Santosha - Niyama)', category: 'Niyama', description: 'Being satisfied and at peace with what one has.' },
  { name: 'Sense of Discipline (Tapas - Niyama)', category: 'Niyama', description: 'Self-discipline, austerity, and persistent effort.' },
  { name: 'Self Study (Svadhyaya - Niyama)', category: 'Niyama', description: 'Self-reflection, study of spiritual/ethical texts, and introspection.' },
  { name: 'Surrender (Ishvara Pranidhana - Niyama)', category: 'Niyama', description: 'Surrender to a higher power or dedication to a higher purpose.' },

  // Yama
  { name: 'Moderation (Brahmacharya - Yama)', category: 'Yama', description: 'Right use of energy, self-restraint, and moderation.' },
  { name: 'Non-greed (Aparigraha - Yama)', category: 'Yama', description: 'Non-possessiveness, simple living, and letting go of unnecessary desires.' },
  { name: 'Non-Stealing (Asteya - Yama)', category: 'Yama', description: 'Not taking what does not belong to you, respect for others\' possessions.' },
  { name: 'Non-Violence (Ahimsa - Yama)', category: 'Yama', description: 'Non-injury in thought, word, and deed.' },
  { name: 'Truthfulness (Satya - Yama)', category: 'Yama', description: 'Truthfulness in words, thoughts, and actions.' },

  // General Attributes
  { name: 'Clear Thinking', category: 'General', description: 'Objectivity and clarity of thought, free from biases or distractions.' },
  { name: 'Common Sense', category: 'General', description: 'Practical judgment and sound decisions in daily matters.' },
  { name: 'Courage', category: 'General', description: 'The ability to do something that frightens one; bravery in facing challenges.' },
  { name: 'Courtesy', category: 'General', description: 'Polite behavior, respect, and consideration for others.' },
  { name: 'Determination', category: 'General', description: 'Firmness of purpose; resoluteness in achieving goals.' },
  { name: 'Diligence', category: 'General', description: 'Careful and persistent work or effort.' },
  { name: 'Humble', category: 'General', description: 'Humility; freedom from pride or arrogance.' },
  { name: 'Initiative', category: 'General', description: 'The ability to assess and initiate things independently.' },
  { name: 'Patience', category: 'General', description: 'The capacity to accept or tolerate delay, trouble, or suffering without getting angry.' },
  { name: 'Poise', category: 'General', description: 'Graceful and elegant bearing in a person; composure and dignity.' },
  { name: 'Reliability', category: 'General', description: 'The quality of being trustworthy and performing consistently well.' },
  { name: 'Resourcefulness', category: 'General', description: 'The ability to find quick and clever ways to overcome difficulties.' },
  { name: 'Self Confidence', category: 'General', description: 'A feeling of trust in one\'s abilities, qualities, and judgment.' },
  { name: 'Self Control', category: 'General', description: 'The ability to control oneself, especially one\'s emotions and desires.' },
  { name: 'Self Reliance', category: 'General', description: 'Reliance on one\'s own powers and resources rather than those of others.' },
  { name: 'Self Respect', category: 'General', description: 'Pride and confidence in oneself; a feeling that one is behaving with honor.' },
  { name: 'Sincerity', category: 'General', description: 'The quality of being free from pretense, deceit, or hypocrisy.' },
  { name: 'Spirit of Service', category: 'General', description: 'Dedication to helping others and contributing to the welfare of society.' },
  { name: 'Sympathy', category: 'General', description: 'Understanding and sharing the feelings of another.' },
  { name: 'Tolerance', category: 'General', description: 'The ability or willingness to tolerate something, in particular the existence of opinions or behavior that one does not necessarily agree with.' },
  { name: 'Unselfishness', category: 'General', description: 'Putting the needs of others before one\'s own; generosity.' }
];

async function main() {
  console.log('Seeding predefined character attributes...');
  for (const attr of defaultAttributes) {
    const existing = await prisma.characterAttribute.findFirst({
      where: {
        name: attr.name,
        userId: null
      }
    });

    if (existing) {
      await prisma.characterAttribute.update({
        where: { id: existing.id },
        data: {
          category: attr.category,
          description: attr.description
        }
      });
    } else {
      await prisma.characterAttribute.create({
        data: {
          name: attr.name,
          category: attr.category,
          description: attr.description,
          isCustom: false,
          userId: null
        }
      });
    }
  }

  // Seed data for gururider35@gmail.com
  const testEmail = 'gururider35@gmail.com';
  console.log(`Seeding user data for ${testEmail}...`);
  let user = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Guru Rider',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        role: 'ADMIN',
        profile: {
          create: {
            theme: 'Classic',
            ageGroup: '25–30'
          }
        }
      }
    });
  } else {
    // Make sure user role is set to ADMIN
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });

    // Ensure profile exists
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    });
    if (!profile) {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          theme: 'Classic',
          ageGroup: '25–30'
        }
      });
    }
  }

  // Fetch predefined attributes
  const dbAttributes = await prisma.characterAttribute.findMany({
    where: { userId: null }
  });

  if (dbAttributes.length > 0) {
    console.log('Cleaning up existing assessments and notes for test user...');
    await prisma.assessment.deleteMany({
      where: { userId: user.id }
    });
    await prisma.personalNote.deleteMany({
      where: { userId: user.id }
    });

    const mockAssessments = [
      {
        attrName: 'Cleanliness (Saucha - Niyama)',
        alignmentScore: 4,
        othersRecognize: 'Yes - Regularly',
        consciousEffort: true,
        effortLevel: 'I am able to practice this without lot of effort',
        practiceFrequency: 'More than 5 times',
        personalNote: 'Kept my working desk and room completely organized this week. Felt very peaceful.',
        daysAgo: 4
      },
      {
        attrName: 'Cleanliness (Saucha - Niyama)',
        alignmentScore: 3,
        othersRecognize: 'Yes - Sometimes',
        consciousEffort: true,
        effortLevel: 'I catch myself for not following this and make effort to correct',
        practiceFrequency: '1 - 5 times',
        personalNote: 'Felt a bit lazy mid-week but cleaned up by Friday.',
        daysAgo: 10
      },
      {
        attrName: 'Courage',
        alignmentScore: 5,
        othersRecognize: 'Yes - Regularly',
        consciousEffort: true,
        effortLevel: 'I am able to practice this without lot of effort',
        practiceFrequency: '1 - 5 times',
        personalNote: 'Spoke up in the meeting and presented my ideas clearly. Others appreciated my clarity.',
        daysAgo: 2
      },
      {
        attrName: 'Truthfulness (Satya - Yama)',
        alignmentScore: 4,
        othersRecognize: 'Yes - Sometimes',
        consciousEffort: true,
        effortLevel: 'I catch myself for not following this and make effort to correct',
        practiceFrequency: 'More than 5 times',
        personalNote: 'Was honest about a project delay instead of giving an excuse.',
        daysAgo: 5
      },
      {
        attrName: 'Patience',
        alignmentScore: 2,
        othersRecognize: 'No - Not at all',
        consciousEffort: false,
        effortLevel: 'I am aware of this trait in my action but hard to practice',
        practiceFrequency: 'Didn’t get to practice this',
        personalNote: 'Lost temper in traffic on Monday. Need to consciously breathe and stay calm.',
        daysAgo: 7
      },
      {
        attrName: 'Sense of Discipline (Tapas - Niyama)',
        alignmentScore: 4,
        othersRecognize: 'Yes - Sometimes',
        consciousEffort: true,
        effortLevel: 'I catch myself for not following this and make effort to correct',
        practiceFrequency: '1 - 5 times',
        personalNote: 'Stuck to my morning routine for 4 out of 5 days.',
        daysAgo: 3
      },
      {
        attrName: 'Determination',
        alignmentScore: 5,
        othersRecognize: 'Yes - Regularly',
        consciousEffort: true,
        effortLevel: 'I am able to practice this without lot of effort',
        practiceFrequency: 'More than 5 times',
        personalNote: 'Completed the task on time despite the complex issues.',
        daysAgo: 1
      }
    ];

    for (const mock of mockAssessments) {
      const attribute = dbAttributes.find(a => a.name === mock.attrName);
      if (attribute) {
        const date = new Date();
        date.setDate(date.getDate() - mock.daysAgo);

        // Create assessment
        await prisma.assessment.create({
          data: {
            userId: user.id,
            characterId: attribute.id,
            assessmentDate: date,
            alignmentScore: mock.alignmentScore,
            othersRecognize: mock.othersRecognize,
            consciousEffort: mock.consciousEffort,
            effortLevel: mock.effortLevel,
            practiceFrequency: mock.practiceFrequency,
            personalNote: mock.personalNote
          }
        });

        // Create personal note
        if (mock.personalNote) {
          await prisma.personalNote.create({
            data: {
              userId: user.id,
              characterId: attribute.id,
              content: mock.personalNote,
              createdAt: date,
              updatedAt: date
            }
          });
        }
      } else {
        console.warn(`Could not find attribute named: ${mock.attrName}`);
      }
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
