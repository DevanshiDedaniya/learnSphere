import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnSphere');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ profileImage: { $exists: true } }).toArray();
  console.log("Users with profileImage:", users.map(u => ({ id: u._id, img: u.profileImage })));
  process.exit();
}
check();
