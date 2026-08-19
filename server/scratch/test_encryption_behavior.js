const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { decrypt } = require('../utils/crypto');

async function verifyEncryption() {
  console.log('--- STARTING ENCRYPTION & DECRYPTION END-TO-END VERIFICATION ---');
  
  const testEmail = 'sarah.jones@example.com';
  
  // 1. Query the user directly from the database using Prisma to check at-rest state
  console.log('1. Checking user data directly in the database...');
  
  // Find by emailHash
  const { hashEmail } = require('../utils/crypto');
  const userInDb = await prisma.user.findUnique({
    where: { emailHash: hashEmail(testEmail) }
  });
  
  if (!userInDb) {
    console.error('FAIL: User not found in database by emailHash!');
    process.exit(1);
  }
  
  console.log('User ID:', userInDb.id);
  console.log('Raw Email in DB:', userInDb.email);
  console.log('Email Hash in DB:', userInDb.emailHash);
  console.log('Raw Picture in DB:', userInDb.picture);
  
  const isEmailEncrypted = userInDb.email.split(':').length === 3;
  if (isEmailEncrypted) {
    console.log('SUCCESS: Email is encrypted in the database!');
  } else {
    console.error('FAIL: Email is NOT encrypted in the database!');
  }
  
  if (userInDb.picture) {
    const isPictureEncrypted = userInDb.picture.split(':').length === 3;
    if (isPictureEncrypted) {
      console.log('SUCCESS: Profile picture/URL is encrypted in the database!');
    } else {
      console.error('FAIL: Profile picture/URL is NOT encrypted in the database!');
    }
  } else {
    console.log('NOTE: Profile picture is null (expected if not set).');
  }

  // 2. Fetch the user via the admin API to verify it gets decrypted properly
  console.log('\n2. Testing Admin API to verify users list decryption...');
  
  // Perform mock login to get token
  const loginRes = await fetch('http://localhost:5000/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isMock: true,
      email: 'gururider35@gmail.com', // Admin user
      name: 'Guru Rider'
    })
  });
  
  const loginData = await loginRes.json();
  const setCookieHeaders = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  const cookieHeader = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
  
  // Query users list via admin endpoint
  const listRes = await fetch('http://localhost:5000/api/admin/users', {
    headers: { 'Cookie': cookieHeader }
  });
  
  const listData = await listRes.json();
  if (!listRes.ok) {
    console.error('FAIL: Failed to fetch admin users list:', listData);
    process.exit(1);
  }
  
  const sarahUser = listData.users.find(u => u.id === userInDb.id);
  if (!sarahUser) {
    console.error('FAIL: Sarah Jones not found in admin list response!');
    process.exit(1);
  }
  
  console.log('Decrypted Email in API response:', sarahUser.email);
  console.log('Decrypted Picture in API response:', sarahUser.picture);
  
  if (sarahUser.email === testEmail) {
    console.log('SUCCESS: Email is correctly decrypted for API clients!');
  } else {
    console.error('FAIL: Email decryption returned incorrect result:', sarahUser.email);
  }

  // 3. Test admin exact search by email
  console.log('\n3. Testing Admin email exact search...');
  const searchRes = await fetch(`http://localhost:5000/api/admin/users?search=${encodeURIComponent(testEmail)}`, {
    headers: { 'Cookie': cookieHeader }
  });
  const searchData = await searchRes.json();
  const foundSearch = searchData.users.find(u => u.id === userInDb.id);
  if (foundSearch) {
    console.log('SUCCESS: Found user via email exact search!');
  } else {
    console.error('FAIL: User not found via email exact search!');
  }

  console.log('\n--- VERIFICATION TEST COMPLETED ---');
}

verifyEncryption()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
