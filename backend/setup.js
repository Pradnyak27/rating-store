const { User } = require('./db');
const dotenv = require('dotenv');
dotenv.config();

const createInitialAdmin = async () => {
  try {
    const email = 'admin@gmail.com';
    const password = 'Admin@123';
    const name = 'Admin User';
    const address = '123 Main St';
    const role = 'System Administrator';

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    // Create the new user with the specified role
    const newUser = await User.create({
      name,
      email,
      password, // The User model's setter will automatically hash this
      address,
      role,
    });

    console.log('Initial admin user created successfully:', newUser.email);
  } catch (error) {
    console.error('Error creating initial admin:', error);
  } finally {
    // It's important to close the database connection
    process.exit();
  }
};

createInitialAdmin();