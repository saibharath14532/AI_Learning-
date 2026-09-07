import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const promoteOrCreateAdmin = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node backend/scripts/createAdmin.js <email>');
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-learning-platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Successfully promoted existing user (${user.name} - ${user.email}) to ADMIN role.`);
    } else {
      console.log(`User with email ${email} not found. Creating new ADMIN user...`);
      const password = process.argv[3] || 'AdminPass123!';
      user = await User.create({
        name: 'System Administrator',
        email: email.toLowerCase(),
        password,
        role: 'admin',
        institution: 'Platform Administration',
        course: 'Admin Portal',
        level: 'Advanced',
      });
      console.log(`Successfully created new ADMIN user (${user.name} - ${user.email}).`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error promoting/creating admin:', error.message);
    process.exit(1);
  }
};

promoteOrCreateAdmin();
