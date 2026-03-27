import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log('Users found:', users.map(u => ({ email: u.email, id: u._id, googleId: u.googleId, secretPasscode: u.secretPasscode })));
  process.exit(0);
};

check();
