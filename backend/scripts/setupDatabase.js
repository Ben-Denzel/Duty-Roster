const { sequelize } = require('../src/models');
const { User, Enterprise, Department } = require('../src/models');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (create tables) - force: true will drop existing tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables synchronized');

    // Create default system admin if it doesn't exist
    const admin = await User.create({
      full_name: 'System Administrator',
      email: 'admin@dutyroster.com',
      password_hash: 'admin123', // Will be hashed
      role: 'systemAdmin'
    });
    console.log('✅ Default system admin created');
    console.log('📧 Email: admin@dutyroster.com');
    console.log('🔑 Password: admin123');

    // Create sample enterprise
    const enterprise = await Enterprise.create({
      name: 'Demo Enterprise',
      created_by: admin.id
    });
    console.log('✅ Sample enterprise created');

    // Create sample department
    const department = await Department.create({
      name: 'IT Department',
      enterprise_id: enterprise.id
    });
    console.log('✅ Sample department created');

    console.log('🎉 Database setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('💡 Make sure PostgreSQL is running and database exists');
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
