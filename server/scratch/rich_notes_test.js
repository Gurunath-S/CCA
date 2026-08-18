const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRichNotes() {
  console.log('--- STARTING ASSESSMENT RICH NOTES VERIFICATION TEST ---');
  
  // 1. Log in via mock login to get session cookies
  let cookies = [];
  try {
    console.log('1. Logging in as development user...');
    const res = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isMock: true,
        email: 'gururider35@gmail.com',
        name: 'Guru Rider'
      })
    });
    
    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      cookies = setCookieHeaders;
      console.log('SUCCESS: Logged in and received session cookies.');
    } else {
      console.error('FAIL: No cookies returned from login!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during login:', err.message);
    process.exit(1);
  }

  // 2. Fetch a character ID
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  let targetCharacterId = '';
  try {
    console.log('2. Fetching user characters...');
    const charRes = await fetch('http://localhost:5000/api/characters', {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    const data = await charRes.json();
    const list = Array.isArray(data) ? data : data.characters;
    if (!list || list.length === 0) {
      console.error('FAIL: No characters list found!');
      process.exit(1);
    }
    targetCharacterId = list[0].id;
    console.log('Using target character ID:', targetCharacterId);
  } catch (err) {
    console.error('Error fetching characters:', err.message);
    process.exit(1);
  }

  // 3. Post an assessment with personalNote containing formatting and script tags
  let createdAssessmentId = '';
  try {
    console.log('3. Submitting assessment with XSS and formatting in personalNote...');
    const payload = {
      characterId: targetCharacterId,
      alignmentScore: 4,
      othersRecognize: 'Yes - Regularly',
      consciousEffort: 'Yes',
      effortLevel: 'I am able to practice this without lot of effort',
      practiceFrequency: 'More than 5 times',
      personalNote: '<p><b>High alignment</b> with Ahimsa today.</p><script>alert("hack")</script>'
    };

    const res = await fetch('http://localhost:5000/api/assessments', {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('FAIL: Assessment submission failed:', data);
      process.exit(1);
    }
    
    createdAssessmentId = data.assessment.id;
    const savedNote = data.assessment.personalNote;
    console.log('Saved personalNote content returned:', savedNote);

    if (savedNote.includes('<b>High alignment</b>') && !savedNote.includes('<script>')) {
      console.log('SUCCESS: Assessment note was successfully sanitized! Script tags stripped while keeping formatting tags.');
    } else {
      console.error('FAIL: Assessment note was NOT properly sanitized!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during assessment submission:', err.message);
    process.exit(1);
  }

  // 4. Cleanup test data directly from the DB
  if (createdAssessmentId) {
    try {
      console.log('4. Cleaning up test assessment from database...');
      await prisma.assessment.delete({
        where: { id: createdAssessmentId }
      });
      console.log('SUCCESS: Cleanup complete.');
    } catch (err) {
      console.error('Error during cleanup:', err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

testRichNotes();
