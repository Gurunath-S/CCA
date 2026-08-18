const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { encrypt, hashEmail } = require('../utils/crypto');

async function migrate() {
  console.log('Starting data migration to encrypt user emails and pictures...');
  
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} user records to check.`);
  
  let migratedCount = 0;
  
  for (const user of users) {
    const plainEmail = user.email;
    const emailHashVal = hashEmail(plainEmail);
    
    // Check if we need to encrypt and hash
    // We determine this if emailHash is missing or if the email field doesn't look encrypted (no ':' parts)
    const isEmailEncrypted = plainEmail.split(':').length === 3;
    const isPictureEncrypted = user.picture ? user.picture.split(':').length === 3 : true;
    
    if (!user.emailHash || !isEmailEncrypted || !isPictureEncrypted) {
      console.log(`Migrating user: ${plainEmail} (ID: ${user.id})`);
      
      const encryptedEmail = encrypt(plainEmail);
      const encryptedPicture = user.picture ? encrypt(user.picture) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: encryptedEmail,
          emailHash: emailHashVal,
          picture: encryptedPicture
        }
      });
      
      migratedCount++;
    }
  }
  
  console.log(`Data migration completed successfully. Migrated ${migratedCount} users.`);
}

migrate()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
