import mongoose from 'mongoose';
import { AdminUser } from '../models/index.js';
import { config } from '../config/index.js';

const createUser = async (email, password, role) => {
  try {
    // Check if user already exists
    const userExists = await AdminUser.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.error(`❌ Error: User with email "${email}" already exists.`);
      return;
    }

    // Create and save the new user
    await AdminUser.create({ email: email.toLowerCase(), password, role });
    console.log(`✅ Successfully created user: ${email} with role: ${role}`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
};

const run = async () => {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error("Usage: node src/scripts/createUser.js <email> <password> <role>");
    console.error("Example: node src/scripts/createUser.js admin@example.com mypassword admin");
    console.error("Roles: admin, viewer");
    return;
  }

  const [email, password, role] = args;

  // Validate the role
  if (!['admin', 'viewer'].includes(role)) {
    console.error(`❌ Error: Invalid role "${role}". Role must be either 'admin' or 'viewer'.`);
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`❌ Error: Invalid email format "${email}".`);
    return;
  }

  // Validate password length
  if (password.length < 6) {
    console.error(`❌ Error: Password must be at least 6 characters long.`);
    return;
  }

  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB connected for user creation.');

    await createUser(email, password, role);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 MongoDB connection closed.');
  }
};

run();