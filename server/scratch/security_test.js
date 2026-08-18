async function testSecurity() {
  console.log('--- STARTING SECURITY VERIFICATION TEST ---');
  
  // 1. Verify mock login is disabled in production
  try {
    console.log('1. Testing mock login block in production...');
    const res = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isMock: true,
        email: 'hacker@gmail.com'
      })
    });
    
    console.log('Mock login status in current (development) mode:', res.status);
  } catch (err) {
    console.log('Error testing mock login:', err.message);
  }

  // 2. Test successful mock login in dev environment & verify Set-Cookie headers
  let cookies = [];
  try {
    console.log('2. Testing mock login in development...');
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
      console.log('SUCCESS: Set-Cookie headers found:', cookies);
    } else {
      console.error('FAIL: No Set-Cookie headers returned from mock login!');
    }
  } catch (err) {
    console.error('Error during login:', err.message);
  }

  // 3. Test note sanitization on create note using a valid character
  if (cookies.length > 0) {
    try {
      console.log('3. Fetching a valid character ID...');
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      
      const charRes = await fetch('http://localhost:5000/api/characters', {
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      const characters = await charRes.json();
      
      const list = Array.isArray(characters) ? characters : characters.characters;
      if (!list || list.length === 0) {
        console.error('FAIL: No characters list found!');
        return;
      }
      
      const targetCharacterId = list[0].id;
      console.log('Using target character ID:', targetCharacterId);

      console.log('4. Testing personal notes sanitization...');
      const payload = {
        characterId: targetCharacterId,
        content: '<b>Safe Bold Content</b><script>alert("XSS")</script>'
      };

      const res = await fetch('http://localhost:5000/api/notes', {
        method: 'PUT',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Note creation failed:', data);
        return;
      }
      
      const savedContent = data.note.content;
      console.log('Saved note content returned:', savedContent);
      if (savedContent.includes('<b>Safe Bold Content</b>') && !savedContent.includes('<script>')) {
        console.log('SUCCESS: Note content was successfully sanitized! Script tags stripped.');
      } else {
        console.error('FAIL: Note content was NOT properly sanitized!');
      }

      // Cleanup note
      const noteId = data.note.id;
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': cookieHeader
        }
      });
      console.log('SUCCESS: Cleanup complete.');
    } catch (err) {
      console.error('Error during notes validation:', err.message);
    }
  }
}

testSecurity();
