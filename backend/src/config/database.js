const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance - supports both individual config and DATABASE_URL
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
      }
    })
  : new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'duty_roster',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: process.env.DB_HOST !== 'localhost' ? {
          require: true,
          rejectUnauthorized: false // This is important for Render and other cloud providers
        } : false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 60000, // Increased timeout for online connections
        idle: 10000
      }
    });

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`📍 Connecting to: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME || 'duty_roster'}`);
    console.log(`👤 User: ${process.env.DB_USER || 'postgres'}`);

    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Test a simple query
    const result = await sequelize.query('SELECT version();');
    console.log('📊 PostgreSQL version:', result[0][0].version);

  } catch (error) {
    console.error('❌ Unable to connect to the database:');
    console.error('🔍 Error details:', error.message);
    console.error('🔧 Error code:', error.code || 'N/A');
    console.error('🌐 Error name:', error.name || 'N/A');

    // Provide helpful troubleshooting tips
    console.log('\n🛠️  Troubleshooting tips:');
    console.log('1. Check if your database credentials are correct');
    console.log('2. Ensure your database server is running and accessible');
    console.log('3. Verify firewall settings allow connections on port', process.env.DB_PORT || 5432);
    console.log('4. For cloud databases, ensure SSL is properly configured');
    console.log('5. Check if your IP address is whitelisted (if required)');

    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
