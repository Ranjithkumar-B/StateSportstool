async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athleteId: 'admin', password: 'admin123' })
    });
    const data = await res.json();
    console.log('Login Response:', data);
  } catch (err) {
    console.error('Login Error:', err.message);
  }
}
testLogin();
