async function testReg() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Kumar',
        athleteId: 'ATH-TN-99',
        password: 'password123',
        role: 'athlete',
        gender: 'male',
        fatherName: 'Suresh Kumar',
        dateOfBirth: '2004-05-15',
        phone: '9876543210',
        sport: 'Cricket',
        state: 'TAMIL NADU',
        address: 'THIRUVANAMALAI, TAMIL NADU'
      })
    });
    const data = await res.json();
    console.log('Register Response:', data);
  } catch (err) {
    console.error('Register Error:', err.message);
  }
}
testReg();
