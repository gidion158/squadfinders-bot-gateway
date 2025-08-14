import mongoose from 'mongoose';
import 'dotenv/config';
import {AdminUser} from '../models/player.js';
import {config} from '../config.js';

// This is the core function to add a user
const createUser = async (email, password, role) => {
    try {
        // 1. Check if user already exists
        const userExists = await AdminUser.findOne({email});
        if (userExists) {
            console.error(`❌ Error: User with email "${email}" already exists.`);
            return;
        }

        // 2. Create and save the new user
        await AdminUser.create({email, password, role});
        console.log(`✅ Successfully created user: ${email} with role: ${role}`);

    } catch (error) {
        console.error('❌ Error creating user:', error.message);
    }
};

// This is the main function that runs the script
const run = async () => {
    // 3. Get arguments from the command line
    const args = process.argv.slice(2); // The first 2 args are 'node' and the script path

    if (args.length !== 3) {
        console.error("Usage: node create-user.js <email> <password> <role>");
        console.error("Example: node create-user.js test@example.com mypassword viewer");
        return; // Exit if the wrong number of arguments are provided
    }

    const [email, password, role] = args;

    // 4. Validate the role
    if (!['admin', 'viewer'].includes(role)) {
        console.error(`❌ Error: Invalid role "${role}". Role must be either 'admin' or 'viewer'.`);
        return;
    }

    try {
        // 5. Connect to DB
        const MONGO_URI = config.mongodb.uri;
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected for user creation.');

        // 6. Run the creation logic
        await createUser(email, password, role);

    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        // 7. ALWAYS disconnect from the database
        await mongoose.disconnect();
        console.log('ℹ️ MongoDB connection closed.');
    }
};

// Execute the script
run();