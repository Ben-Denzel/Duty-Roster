const { sequelize } = require('../src/models');
const { User, Enterprise, Department, Roster, Shift, ShiftAssignment } = require('../src/models');
const bcrypt = require('bcryptjs');

async function createTestData() {
  try {
    console.log('🔄 Creating comprehensive test data...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if system admin exists
    let admin = await User.findOne({ where: { email: 'admin@dutyroster.com' } });
    if (!admin) {
      admin = await User.create({
        full_name: 'System Administrator',
        email: 'admin@dutyroster.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'systemAdmin'
      });
      console.log('✅ System admin created');
    } else {
      console.log('✅ System admin already exists');
    }

    // Check if enterprise exists
    let enterprise = await Enterprise.findOne({ where: { name: 'Demo Enterprise' } });
    if (!enterprise) {
      enterprise = await Enterprise.create({
        name: 'Demo Enterprise',
        created_by: admin.id
      });
      console.log('✅ Demo enterprise created');
    } else {
      console.log('✅ Demo enterprise already exists');
    }

    // Check if department exists
    let department = await Department.findOne({ where: { name: 'IT Department' } });
    if (!department) {
      department = await Department.create({
        name: 'IT Department',
        enterprise_id: enterprise.id
      });
      console.log('✅ IT Department created');
    } else {
      console.log('✅ IT Department already exists');
    }

    // Create Enterprise Admin
    let enterpriseAdmin = await User.findOne({ where: { email: 'enterprise.admin@demo.com' } });
    if (!enterpriseAdmin) {
      enterpriseAdmin = await User.create({
        full_name: 'Enterprise Admin',
        email: 'enterprise.admin@demo.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'enterpriseAdmin',
        enterprise_id: enterprise.id
      });
      console.log('✅ Enterprise admin created');
    } else {
      console.log('✅ Enterprise admin already exists');
    }

    // Create Department Manager
    let manager = await User.findOne({ where: { email: 'manager@demo.com' } });
    if (!manager) {
      manager = await User.create({
        full_name: 'Department Manager',
        email: 'manager@demo.com',
        password_hash: await bcrypt.hash('manager123', 10),
        role: 'manager',
        enterprise_id: enterprise.id,
        department_id: department.id
      });
      console.log('✅ Department manager created');
    } else {
      console.log('✅ Department manager already exists');
    }

    // Create Test Employees
    const employeeData = [
      { name: 'John Smith', email: 'john.smith@demo.com' },
      { name: 'Jane Doe', email: 'jane.doe@demo.com' },
      { name: 'Mike Johnson', email: 'mike.johnson@demo.com' },
      { name: 'Sarah Wilson', email: 'sarah.wilson@demo.com' }
    ];

    const employees = [];
    for (const emp of employeeData) {
      let employee = await User.findOne({ where: { email: emp.email } });
      if (!employee) {
        employee = await User.create({
          full_name: emp.name,
          email: emp.email,
          password_hash: await bcrypt.hash('employee123', 10),
          role: 'employee',
          enterprise_id: enterprise.id,
          department_id: department.id
        });
        console.log(`✅ Employee created: ${emp.name}`);
      } else {
        console.log(`✅ Employee already exists: ${emp.name}`);
      }
      employees.push(employee);
    }

    // Create a Published Roster with Shifts
    let roster = await Roster.findOne({ where: { name: 'Weekly Schedule - Test' } });
    if (!roster) {
      roster = await Roster.create({
        name: 'Weekly Schedule - Test',
        description: 'Test roster with published shifts for employees',
        department_id: department.id,
        created_by: enterpriseAdmin.id,
        status: 'published', // PUBLISHED STATUS
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-01-21')
      });
      console.log('✅ Published roster created');
    } else {
      console.log('✅ Published roster already exists');
    }

    // Create Shifts for the Published Roster
    const shiftData = [
      { date: '2024-01-15', start: '09:00', end: '17:00', title: 'Morning Shift', type: 'day' },
      { date: '2024-01-15', start: '17:00', end: '01:00', title: 'Evening Shift', type: 'night' },
      { date: '2024-01-16', start: '09:00', end: '17:00', title: 'Morning Shift', type: 'day' },
      { date: '2024-01-16', start: '17:00', end: '01:00', title: 'Evening Shift', type: 'night' },
      { date: '2024-01-17', start: '09:00', end: '17:00', title: 'Morning Shift', type: 'day' },
      { date: '2024-01-18', start: '09:00', end: '17:00', title: 'Morning Shift', type: 'day' },
      { date: '2024-01-19', start: '09:00', end: '17:00', title: 'Morning Shift', type: 'day' }
    ];

    const shifts = [];
    for (const shiftInfo of shiftData) {
      let shift = await Shift.findOne({ 
        where: { 
          roster_id: roster.id,
          date: shiftInfo.date,
          start_time: shiftInfo.start
        } 
      });
      
      if (!shift) {
        shift = await Shift.create({
          roster_id: roster.id,
          date: shiftInfo.date,
          start_time: shiftInfo.start,
          end_time: shiftInfo.end,
          title: shiftInfo.title,
          shift_type: shiftInfo.type,
          required_staff: 1
        });
        console.log(`✅ Shift created: ${shiftInfo.date} ${shiftInfo.start}-${shiftInfo.end}`);
      } else {
        console.log(`✅ Shift already exists: ${shiftInfo.date} ${shiftInfo.start}-${shiftInfo.end}`);
      }
      shifts.push(shift);
    }

    // Assign Employees to Shifts
    const assignments = [
      { employee: employees[0], shift: shifts[0] }, // John - Mon Morning
      { employee: employees[1], shift: shifts[1] }, // Jane - Mon Evening  
      { employee: employees[0], shift: shifts[2] }, // John - Tue Morning
      { employee: employees[2], shift: shifts[3] }, // Mike - Tue Evening
      { employee: employees[1], shift: shifts[4] }, // Jane - Wed Morning
      { employee: employees[3], shift: shifts[5] }, // Sarah - Thu Morning
      { employee: employees[0], shift: shifts[6] }  // John - Fri Morning
    ];

    for (const assignment of assignments) {
      let existing = await ShiftAssignment.findOne({
        where: {
          employee_id: assignment.employee.id,
          shift_id: assignment.shift.id
        }
      });

      if (!existing) {
        await ShiftAssignment.create({
          employee_id: assignment.employee.id,
          shift_id: assignment.shift.id,
          status: 'confirmed'
        });
        console.log(`✅ Assigned ${assignment.employee.full_name} to shift on ${assignment.shift.date}`);
      } else {
        console.log(`✅ Assignment already exists: ${assignment.employee.full_name} on ${assignment.shift.date}`);
      }
    }

    console.log('\n🎉 Test data creation completed successfully!');
    console.log('\n📋 EMPLOYEE CREDENTIALS TO TEST:');
    console.log('================================');
    console.log('👤 Employee: John Smith');
    console.log('📧 Email: john.smith@demo.com');
    console.log('🔑 Password: employee123');
    console.log('📅 Assigned Shifts: 3 shifts (Mon, Tue, Fri mornings)');
    console.log('');
    console.log('👤 Employee: Jane Doe');
    console.log('📧 Email: jane.doe@demo.com');
    console.log('🔑 Password: employee123');
    console.log('📅 Assigned Shifts: 2 shifts (Mon evening, Wed morning)');
    console.log('');
    console.log('👤 Employee: Mike Johnson');
    console.log('📧 Email: mike.johnson@demo.com');
    console.log('🔑 Password: employee123');
    console.log('📅 Assigned Shifts: 1 shift (Tue evening)');
    console.log('');
    console.log('👤 Employee: Sarah Wilson');
    console.log('📧 Email: sarah.wilson@demo.com');
    console.log('🔑 Password: employee123');
    console.log('📅 Assigned Shifts: 1 shift (Thu morning)');
    console.log('\n🔗 All shifts are in a PUBLISHED roster, so employees should see them!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  createTestData();
}

module.exports = createTestData;
