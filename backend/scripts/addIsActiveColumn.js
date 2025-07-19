const { sequelize } = require('../src/models');

async function addIsActiveColumn() {
  try {
    console.log('Adding is_active column to users table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);
    
    if (results.length > 0) {
      console.log('Column is_active already exists in users table');
      return;
    }
    
    // Add the column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true
    `);
    
    console.log('Successfully added is_active column to users table');
    
  } catch (error) {
    console.error('Error adding is_active column:', error);
  } finally {
    await sequelize.close();
  }
}

addIsActiveColumn();
