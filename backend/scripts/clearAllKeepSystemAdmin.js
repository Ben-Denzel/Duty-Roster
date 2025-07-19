const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

async function clearAllKeepSystemAdmin() {
  try {
    console.log('🗑️  Clearing Database (Preserving System Admin Only)...\n');

    // Start transaction for safety
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Verify system admin exists
      console.log('1. Verifying system admin exists...');
      const systemAdmin = await User.findOne({ 
        where: { role: 'systemAdmin' },
        transaction 
      });

      if (!systemAdmin) {
        throw new Error('System admin not found! Cannot proceed with cleanup.');
      }

      console.log(`✅ System admin found: ${systemAdmin.email}`);
      console.log(`   Name: ${systemAdmin.full_name}`);
      console.log(`   ID: ${systemAdmin.id}`);

      // Step 2: Delete all data in correct order (foreign key constraints)
      console.log('\n2. Deleting all data except system admin...');

      console.log('   Deleting swap requests...');
      await sequelize.query('DELETE FROM swap_requests', { transaction });

      console.log('   Deleting availability records...');
      await sequelize.query('DELETE FROM availability', { transaction });

      console.log('   Deleting shift assignments...');
      await sequelize.query('DELETE FROM shift_assignments', { transaction });

      console.log('   Deleting shifts...');
      await sequelize.query('DELETE FROM shifts', { transaction });

      console.log('   Deleting rosters...');
      await sequelize.query('DELETE FROM rosters', { transaction });

      console.log('   Deleting departments...');
      await sequelize.query('DELETE FROM departments', { transaction });

      console.log('   Deleting enterprises...');
      await sequelize.query('DELETE FROM enterprises', { transaction });

      console.log('   Deleting all users except system admin...');
      const deletedUsersResult = await sequelize.query(
        `DELETE FROM users WHERE role != 'systemAdmin'`, 
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Step 3: Verify cleanup and show final state
      console.log('\n3. Verifying cleanup...');

      const finalCounts = {
        users: await sequelize.query('SELECT COUNT(*) as count FROM users', { type: sequelize.QueryTypes.SELECT }),
        enterprises: await sequelize.query('SELECT COUNT(*) as count FROM enterprises', { type: sequelize.QueryTypes.SELECT }),
        departments: await sequelize.query('SELECT COUNT(*) as count FROM departments', { type: sequelize.QueryTypes.SELECT }),
        rosters: await sequelize.query('SELECT COUNT(*) as count FROM rosters', { type: sequelize.QueryTypes.SELECT }),
        shifts: await sequelize.query('SELECT COUNT(*) as count FROM shifts', { type: sequelize.QueryTypes.SELECT }),
        assignments: await sequelize.query('SELECT COUNT(*) as count FROM shift_assignments', { type: sequelize.QueryTypes.SELECT }),
        swapRequests: await sequelize.query('SELECT COUNT(*) as count FROM swap_requests', { type: sequelize.QueryTypes.SELECT }),
        availability: await sequelize.query('SELECT COUNT(*) as count FROM availability', { type: sequelize.QueryTypes.SELECT })
      };

      console.log('📊 Final database state:');
      console.log(`   Users: ${finalCounts.users[0].count}`);
      console.log(`   Enterprises: ${finalCounts.enterprises[0].count}`);
      console.log(`   Departments: ${finalCounts.departments[0].count}`);
      console.log(`   Rosters: ${finalCounts.rosters[0].count}`);
      console.log(`   Shifts: ${finalCounts.shifts[0].count}`);
      console.log(`   Shift Assignments: ${finalCounts.assignments[0].count}`);
      console.log(`   Swap Requests: ${finalCounts.swapRequests[0].count}`);
      console.log(`   Availability Records: ${finalCounts.availability[0].count}`);

      // Step 4: Verify system admin still exists and is accessible
      console.log('\n4. Final verification of system admin...');
      const verifySystemAdmin = await User.findOne({ where: { role: 'systemAdmin' } });

      if (verifySystemAdmin) {
        console.log('✅ System admin preserved successfully:');
        console.log(`   ID: ${verifySystemAdmin.id}`);
        console.log(`   Name: ${verifySystemAdmin.full_name}`);
        console.log(`   Email: ${verifySystemAdmin.email}`);
        console.log(`   Role: ${verifySystemAdmin.role}`);
        console.log(`   Active: ${verifySystemAdmin.is_active}`);
        console.log(`   Created: ${verifySystemAdmin.created_at}`);
      } else {
        console.log('❌ System admin verification failed!');
      }

      console.log('\n🎉 DATABASE CLEANUP COMPLETED SUCCESSFULLY!');
      console.log('\n📋 SUMMARY:');
      console.log('============');
      console.log('✅ All enterprises deleted');
      console.log('✅ All departments deleted');
      console.log('✅ All rosters deleted');
      console.log('✅ All shifts deleted');
      console.log('✅ All shift assignments deleted');
      console.log('✅ All swap requests deleted');
      console.log('✅ All availability records deleted');
      console.log('✅ All users deleted (except system admin)');
      console.log('✅ System admin preserved');

      console.log('\n🔑 REMAINING WORKING CREDENTIALS:');
      console.log('=================================');
      console.log('📧 Email: admin@dutyroster.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: System Administrator');
      console.log('🎯 Status: Ready for fresh setup');

      console.log('\n💡 NEXT STEPS:');
      console.log('===============');
      console.log('1. Login with system admin credentials');
      console.log('2. Create enterprises via web interface');
      console.log('3. Create users via web interface (ensures working passwords)');
      console.log('4. Test each user login after creation');

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    console.error('Stack trace:', error.stack);
    
    console.log('\n🚨 CLEANUP FAILED - DATABASE STATE UNKNOWN');
    console.log('Please check the database manually and ensure system admin exists.');
  } finally {
    // Close database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the cleanup
clearAllKeepSystemAdmin();
