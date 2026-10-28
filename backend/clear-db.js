const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function clearDB() {
  try {
    console.log('Connecting to MongoDB Atlas to purge dummy data...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const collections = ['candidates', 'trainingsessions', 'squadassignments', 'pointledgers', 'users'];
    
    for (const col of collections) {
      try {
        await mongoose.connection.collection(col).deleteMany({});
        console.log(`🧹 Purged collection: ${col}`);
      } catch (err) {
        console.warn(`Could not clear collection ${col}:`, err.message);
      }
    }

    console.log('✨ All dummy data successfully wiped from MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Clear DB Error:', err.message);
    process.exit(1);
  }
}

clearDB();
