async function testRegisterForm() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Athlete',
        athleteId: 'ATH-TEST-2026',
        password: 'password123',
        role: 'athlete',
        gender: 'Male', // Capitalized from UI select
        fatherName: 'Father Name',
        dateOfBirth: '2004-05-20',
        phone: '9876543210',
        sport: 'Cricket',
        state: 'Tamil Nadu',
        address: 'Test Address'
      })
    });
    const data = await res.json();
    console.log('Register Response Status:', res.status, data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
testRegisterForm();
