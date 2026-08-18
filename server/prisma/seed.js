const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { encrypt, hashEmail } = require('../utils/crypto');

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
  const testEmailHash = hashEmail(testEmail);
  let user = await prisma.user.findUnique({
    where: { emailHash: testEmailHash }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: encrypt(testEmail),
        emailHash: testEmailHash,
        name: 'Guru Rider',
        picture: encrypt('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'),
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

    const mockAssessments = [];
    const recognitionOptions = [
      'Yes - Regularly',
      'Yes - Sometimes',
      'No - Not at all',
      'Others remind me for not having this trait'
    ];
    const effortLevelOptions = [
      'I am aware of this trait in my action but hard to practice',
      'I catch myself for not following this and make effort to correct',
      'I am able to practice this without lot of effort'
    ];
    const frequencyOptions = [
      'Didn’t get to practice this',
      '1 - 5 times',
      'More than 5 times'
    ];

    for (let i = 1; i <= 766; i++) {
      const attr = dbAttributes[i % dbAttributes.length];
      const alignmentScore = (i % 5) + 1; // 1 to 5
      const consciousEffort = (i % 3) !== 0;
      const othersRecognize = recognitionOptions[i % recognitionOptions.length];
      const effortLevel = effortLevelOptions[i % effortLevelOptions.length];
      const practiceFrequency = frequencyOptions[i % frequencyOptions.length];
      const personalNote = `Reflection Note Day ${i}: Consciously worked on ${attr.name}. Felt progressive.`;

      mockAssessments.push({
        attrName: attr.name,
        alignmentScore,
        othersRecognize,
        consciousEffort,
        effortLevel,
        practiceFrequency,
        personalNote,
        daysAgo: i
      });
    }


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

  // Seed multiple mock users with location data for analytics testing
  console.log('Seeding mock users with geographic data...');
  const mockUsers = [
    { email: 'sarah.jones@example.com', name: 'Sarah Jones', country: 'us', city: 'New York' },
    { email: 'raj.patel@example.com', name: 'Raj Patel', country: 'in', city: 'Mumbai' },
    { email: 'amit.sharma@example.com', name: 'Amit Sharma', country: 'in', city: 'Delhi' },
    { email: 'john.smith@example.com', name: 'John Smith', country: 'us', city: 'San Francisco' },
    { email: 'david.miller@example.com', name: 'David Miller', country: 'gb', city: 'London' },
    { email: 'emma.watson@example.com', name: 'Emma Watson', country: 'gb', city: 'Edinburgh' },
    { email: 'yuki.tanaka@example.com', name: 'Yuki Tanaka', country: 'jp', city: 'Tokyo' },
    { email: 'sophie.dubois@example.com', name: 'Sophie Dubois', country: 'fr', city: 'Paris' },
    { email: 'hans.schmidt@example.com', name: 'Hans Schmidt', country: 'de', city: 'Berlin' },
    { email: 'alex.gomez@example.com', name: 'Alex Gomez', country: 'mx', city: 'Mexico City' },
    { email: 'li.wei@example.com', name: 'Li Wei', country: 'cn', city: 'Beijing' },
    { email: 'lucas.silva@example.com', name: 'Lucas Silva', country: 'br', city: 'Sao Paulo' }
  ];

  for (const mock of mockUsers) {
    const mockEmailHash = hashEmail(mock.email);
    const existingUser = await prisma.user.findUnique({
      where: { emailHash: mockEmailHash }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: encrypt(mock.email),
          emailHash: mockEmailHash,
          name: mock.name,
          role: 'USER',
          profile: {
            create: {
              theme: 'Serenity',
              ageGroup: '20–25',
              country: mock.country,
              city: mock.city
            }
          }
        }
      });
    } else {
      await prisma.userProfile.upsert({
        where: { userId: existingUser.id },
        update: {
          country: mock.country,
          city: mock.city
        },
        create: {
          userId: existingUser.id,
          country: mock.country,
          city: mock.city,
          theme: 'Serenity',
          ageGroup: '20–25'
        }
      });
    }
  }

  // Standardize existing user country names to ISO codes
  const profiles = await prisma.userProfile.findMany();
  for (const prof of profiles) {
    if (prof.country && prof.country.toLowerCase() === 'india') {
      await prisma.userProfile.update({
        where: { id: prof.id },
        data: { country: 'in' }
      });
    }
  }

  console.log('Database seeded successfully with locations!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
