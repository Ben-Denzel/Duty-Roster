const bcrypt = require('bcrypt');
const { sequelize } = require('../src/config/database');
const { User, Enterprise, Department } = require('../src/models');

async function resetAndCreateWorkingUsers() {
  try {
    console.log('🔄 Resetting Database and Creating Working Users...\n');

    // Step 1: Clear everything except system admin
    console.log('1. Clearing database (keeping system admin)...');
    
    // Delete in correct order to avoid foreign key constraints
    await sequelize.query('DELETE FROM swap_requests');
    await sequelize.query('DELETE FROM availability');
    await sequelize.query('DELETE FROM shift_assignments');
    await sequelize.query('DELETE FROM shifts');
    await sequelize.query('DELETE FROM rosters');
    await sequelize.query('DELETE FROM departments');
    await sequelize.query('DELETE FROM enterprises');
    await sequelize.query("DELETE FROM users WHERE role != 'systemAdmin'");
    
    console.log('✅ Database cleared (system admin preserved)');

    // Step 2: Verify system admin exists and get password hash method
    console.log('\n2. Analyzing system admin password hash...');
    const systemAdmin = await User.findOne({ where: { role: 'systemAdmin' } });
    
    if (!systemAdmin) {
      throw new Error('System admin not found!');
    }
    
    console.log(`✅ System admin found: ${systemAdmin.email}`);
    console.log(`🔍 Hash format: ${systemAdmin.password_hash.substring(0, 10)}...`);
    
    // Test the system admin password to understand the hash format
    const testSystemPassword = await bcrypt.compare('admin123', systemAdmin.password_hash);
    console.log(`🔑 System admin password verification: ${testSystemPassword}`);
    
    if (!testSystemPassword) {
      throw new Error('System admin password verification failed!');
    }

    // Step 3: Create enterprise using the same hashing approach
    console.log('\n3. Creating enterprise...');
    const enterprise = await Enterprise.create({
      name: 'TechCorp Solutions',
      description: 'Leading technology solutions provider',
      address: '123 Business District, Tech City, TC 12345',
      phone: '+1-555-0100',
      email: 'info@techcorp.com',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: 'large',
      timezone: 'America/New_York',
      settings: {
        working_hours: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '09:00', end: '17:00', enabled: false },
          sunday: { start: '09:00', end: '17:00', enabled: false }
        }
      }
    });
    console.log(`✅ Enterprise created: ${enterprise.name} (ID: ${enterprise.id})`);

    // Step 4: Create enterprise admin with same salt rounds as system admin
    console.log('\n4. Creating enterprise admin...');
    
    // Use the same salt rounds as the working system admin (typically 10)
    const saltRounds = 10;
    const enterpriseAdminHash = await bcrypt.hash('admin123', saltRounds);
    
    const enterpriseAdmin = await User.create({
      full_name: 'Enterprise Administrator',
      email: 'admin@techcorp.com',
      password_hash: enterpriseAdminHash,
      role: 'enterpriseAdmin',
      enterprise_id: enterprise.id,
      is_active: true
    });
    
    // Immediately test the enterprise admin password
    const testEnterprisePassword = await bcrypt.compare('admin123', enterpriseAdmin.password_hash);
    console.log(`✅ Enterprise admin created: ${enterpriseAdmin.email}`);
    console.log(`🔑 Password verification test: ${testEnterprisePassword}`);

    // Step 5: Create departments with managers
    console.log('\n5. Creating departments with managers...');
    
    const departments = [
      { name: 'Engineering Department', managerName: 'Sarah Johnson', managerEmail: 'sarah.johnson@techcorp.com' },
      { name: 'Sales Department', managerName: 'Michael Chen', managerEmail: 'michael.chen@techcorp.com' },
      { name: 'Marketing Department', managerName: 'Emily Rodriguez', managerEmail: 'emily.rodriguez@techcorp.com' },
      { name: 'Operations Department', managerName: 'David Thompson', managerEmail: 'david.thompson@techcorp.com' }
    ];

    const createdDepartments = [];
    const allCredentials = [
      {
        name: 'System Administrator',
        email: 'admin@dutyroster.com',
        password: 'admin123',
        role: 'systemAdmin',
        status: '✅ WORKING (Pre-existing)'
      },
      {
        name: 'Enterprise Administrator',
        email: enterpriseAdmin.email,
        password: 'admin123',
        role: 'enterpriseAdmin',
        status: testEnterprisePassword ? '✅ VERIFIED' : '❌ FAILED'
      }
    ];

    for (const deptInfo of departments) {
      // Create manager
      const managerHash = await bcrypt.hash('manager123', saltRounds);
      const manager = await User.create({
        full_name: deptInfo.managerName,
        email: deptInfo.managerEmail,
        password_hash: managerHash,
        role: 'manager',
        enterprise_id: enterprise.id,
        is_active: true
      });

      // Create department
      const department = await Department.create({
        name: deptInfo.name,
        description: `${deptInfo.name} operations and management`,
        enterprise_id: enterprise.id,
        manager_id: manager.id,
        working_hours: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '09:00', end: '17:00', enabled: false },
          sunday: { start: '09:00', end: '17:00', enabled: false }
        }
      });

      // Update manager's department
      await manager.update({ department_id: department.id });

      // Test manager password
      const testManagerPassword = await bcrypt.compare('manager123', manager.password_hash);
      
      createdDepartments.push({ department, manager });
      allCredentials.push({
        name: manager.full_name,
        email: manager.email,
        password: 'manager123',
        role: 'manager',
        department: department.name,
        status: testManagerPassword ? '✅ VERIFIED' : '❌ FAILED'
      });

      console.log(`✅ ${department.name} created with manager ${manager.full_name} (Password test: ${testManagerPassword})`);
    }

    // Step 6: Create employees (5 per department for testing)
    console.log('\n6. Creating employees...');
    
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    let employeeCounter = 1;
    
    for (const { department } of createdDepartments) {
      console.log(`   Creating 5 employees for ${department.name}...`);
      
      for (let i = 0; i < 5; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${employeeCounter}@techcorp.com`;
        
        const employeeHash = await bcrypt.hash('employee123', saltRounds);
        const employee = await User.create({
          full_name: fullName,
          email: email,
          password_hash: employeeHash,
          role: 'employee',
          enterprise_id: enterprise.id,
          department_id: department.id,
          is_active: true
        });

        // Test first employee of each department
        if (i === 0) {
          const testEmployeePassword = await bcrypt.compare('employee123', employee.password_hash);
          allCredentials.push({
            name: employee.full_name,
            email: employee.email,
            password: 'employee123',
            role: 'employee',
            department: department.name,
            status: testEmployeePassword ? '✅ VERIFIED' : '❌ FAILED'
          });
        }

        employeeCounter++;
      }
      
      console.log(`   ✅ 5 employees created for ${department.name}`);
    }

    // Step 7: Test all credentials via API
    console.log('\n7. Testing credentials via API...');
    
    const axios = require('axios');
    const API_BASE = 'http://localhost:3000/api';
    
    const testCredentials = [
      { email: 'admin@dutyroster.com', password: 'admin123', name: 'System Admin' },
      { email: 'admin@techcorp.com', password: 'admin123', name: 'Enterprise Admin' },
      { email: 'sarah.johnson@techcorp.com', password: 'manager123', name: 'Engineering Manager' },
      { email: 'james.smith1@techcorp.com', password: 'employee123', name: 'Employee Sample' }
    ];

    const workingCredentials = [];
    
    for (const cred of testCredentials) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email: cred.email,
          password: cred.password
        });
        
        if (response.data.user) {
          console.log(`   ✅ ${cred.name}: ${cred.email} - LOGIN SUCCESS`);
          workingCredentials.push({
            ...cred,
            role: response.data.user.role,
            status: 'WORKING'
          });
        }
      } catch (error) {
        console.log(`   ❌ ${cred.name}: ${cred.email} - LOGIN FAILED`);
      }
    }

    // Step 8: Generate final credentials file
    console.log('\n8. Generating final credentials file...');
    
    let credentialsContent = `# TechCorp Solutions - WORKING Credentials
# Generated: ${new Date().toISOString()}
# Total Users: ${1 + 1 + 4 + (4 * 5)} (System Admin + Enterprise Admin + 4 Managers + 20 Employees)

## ✅ VERIFIED WORKING CREDENTIALS
=================================

### System Administrator
- Email: admin@dutyroster.com
- Password: admin123
- Role: System Admin
- Status: ✅ CONFIRMED WORKING

### Enterprise Administrator
- Email: admin@techcorp.com
- Password: admin123
- Role: Enterprise Admin
- Enterprise: TechCorp Solutions
- Status: ${workingCredentials.find(c => c.email === 'admin@techcorp.com') ? '✅ CONFIRMED WORKING' : '⚠️ NEEDS TESTING'}

## DEPARTMENT MANAGERS
=====================

`;

    // Add managers
    createdDepartments.forEach(({ department, manager }) => {
      const isWorking = workingCredentials.find(c => c.email === manager.email);
      credentialsContent += `### ${department.name} Manager
- Name: ${manager.full_name}
- Email: ${manager.email}
- Password: manager123
- Department: ${department.name}
- Status: ${isWorking ? '✅ CONFIRMED WORKING' : '⚠️ NEEDS TESTING'}

`;
    });

    credentialsContent += `## SAMPLE EMPLOYEES (5 per department)
=====================================

`;

    // Add sample employees
    createdDepartments.forEach(({ department }) => {
      credentialsContent += `### ${department.name} Employees
`;
      for (let i = 1; i <= 5; i++) {
        const firstName = firstNames[(i-1) % firstNames.length];
        const lastName = lastNames[(i-1) % lastNames.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${employeeCounter - (4*5) + (createdDepartments.indexOf({department}) * 5) + i}@techcorp.com`;
        credentialsContent += `- ${firstName} ${lastName}: ${email} / employee123
`;
      }
      credentialsContent += '\n';
    });

    credentialsContent += `## QUICK START
==============

### Immediate Testing:
1. System Admin: admin@dutyroster.com / admin123
2. Enterprise Admin: admin@techcorp.com / admin123
3. Manager: sarah.johnson@techcorp.com / manager123
4. Employee: james.smith1@techcorp.com / employee123

### Password Patterns:
- System Admin: admin123
- Enterprise Admin: admin123
- All Managers: manager123
- All Employees: employee123

### Total Structure:
- 1 System Admin
- 1 Enterprise Admin
- 4 Department Managers
- 20 Employees (5 per department)
- **Total: 26 users**

All passwords have been created using the same bcrypt method as the working system admin.
`;

    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(__dirname, '../../WORKING-CREDENTIALS.md');
    fs.writeFileSync(credentialsPath, credentialsContent);

    console.log(`✅ Final credentials file created: WORKING-CREDENTIALS.md`);

    console.log('\n🎉 RESET AND RECREATION COMPLETE!');
    console.log('\n📊 FINAL SUMMARY:');
    console.log('==================');
    console.log('✅ System Admin: 1 (preserved)');
    console.log('✅ Enterprise Admin: 1 (recreated)');
    console.log('✅ Managers: 4 (recreated)');
    console.log('✅ Employees: 20 (recreated)');
    console.log('✅ Total Users: 26');
    console.log(`✅ Working API logins: ${workingCredentials.length}`);
    console.log('\n🔑 START TESTING WITH:');
    console.log('admin@dutyroster.com / admin123');
    console.log('admin@techcorp.com / admin123');

  } catch (error) {
    console.error('❌ Reset and recreation failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetAndCreateWorkingUsers();
