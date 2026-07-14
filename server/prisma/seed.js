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
