const { sequelize } = require('../src/config/database');
const {
  User,
  Enterprise,
  Department,
  Roster,
  Shift,
  ShiftAssignment,
  SwapRequest,
  Availability
} = require('../src/models');

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...\n');

    // Start transaction for safety
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Delete in correct order to avoid foreign key constraints
      console.log('1. Deleting swap requests...');
      await SwapRequest.destroy({ where: {}, transaction });
      console.log('✅ Swap requests deleted');

      console.log('2. Deleting availability records...');
      await Availability.destroy({ where: {}, transaction });
      console.log('✅ Availability records deleted');

      console.log('3. Deleting shift assignments...');
      await ShiftAssignment.destroy({ where: {}, transaction });
      console.log('✅ Shift assignments deleted');

      console.log('4. Deleting shifts...');
      await Shift.destroy({ where: {}, transaction });
      console.log('✅ Shifts deleted');

      console.log('5. Deleting rosters...');
      await Roster.destroy({ where: {}, transaction });
      console.log('✅ Rosters deleted');

      console.log('6. Deleting departments...');
      await Department.destroy({ where: {}, transaction });
      console.log('✅ Departments deleted');

      console.log('7. Deleting enterprises...');
      await Enterprise.destroy({ where: {}, transaction });
      console.log('✅ Enterprises deleted');

      console.log('8. Deleting users (except system admin)...');
      const deletedUsers = await User.destroy({
        where: {
          role: {
            [sequelize.Sequelize.Op.ne]: 'systemAdmin'
          }
        },
        transaction
      });
      console.log(`✅ ${deletedUsers} users deleted (system admin preserved)`);

      // Commit transaction
      await transaction.commit();

      // Step 2: Verify system admin still exists
      console.log('\n9. Verifying system admin...');
      const systemAdmin = await User.findOne({
        where: { role: 'systemAdmin' }
      });

      if (systemAdmin) {
        console.log('✅ System admin preserved:');
        console.log(`   Name: ${systemAdmin.full_name}`);
        console.log(`   Email: ${systemAdmin.email}`);
        console.log(`   Role: ${systemAdmin.role}`);
      } else {
        console.log('❌ System admin not found!');
      }

      // Step 3: Show final counts
      console.log('\n10. Final database state:');
      const counts = {
        users: await User.count(),
        enterprises: await Enterprise.count(),
        departments: await Department.count(),
        rosters: await Roster.count(),
        shifts: await Shift.count(),
        assignments: await ShiftAssignment.count(),
        swapRequests: await SwapRequest.count(),
        availability: await Availability.count()
      };

      console.log('📊 Remaining records:');
      Object.entries(counts).forEach(([table, count]) => {
        console.log(`   ${table}: ${count}`);
      });

      console.log('\n🎉 Database cleanup completed successfully!');
      console.log('\n📋 WHAT REMAINS:');
      console.log('================');
      console.log('✅ System Admin user only');
      console.log('✅ All other data cleared');
      console.log('✅ Ready for fresh test data');
      console.log('\n🔑 SYSTEM ADMIN CREDENTIALS:');
      console.log('📧 Email: admin@dutyroster.com');
      console.log('🔑 Password: admin123');

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the cleanup
clearDatabase();
