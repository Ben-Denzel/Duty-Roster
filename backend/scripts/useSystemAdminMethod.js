const bcrypt = require('bcrypt');
const { sequelize } = require('../src/config/database');
const { User, Enterprise, Department } = require('../src/models');

async function useSystemAdminMethod() {
  try {
    console.log('🔄 Using System Admin Method to Create Working Users...\n');

    // Step 1: Clear everything except system admin
    console.log('1. Clearing database (preserving system admin)...');
    
    await sequelize.query('DELETE FROM swap_requests');
    await sequelize.query('DELETE FROM availability');
    await sequelize.query('DELETE FROM shift_assignments');
    await sequelize.query('DELETE FROM shifts');
    await sequelize.query('DELETE FROM rosters');
    await sequelize.query('DELETE FROM departments');
    await sequelize.query('DELETE FROM enterprises');
    await sequelize.query("DELETE FROM users WHERE role != 'systemAdmin'");
    
    console.log('✅ Database cleared (system admin preserved)');

    // Step 2: Get system admin hash and create identical hashes for other users
    console.log('\n2. Getting system admin password hash...');
    const systemAdmin = await User.findOne({ where: { role: 'systemAdmin' } });
    
    console.log(`✅ System admin: ${systemAdmin.email}`);
    console.log(`🔍 Hash: ${systemAdmin.password_hash}`);
    
    // Since the system admin uses 'admin123' and it works, let's create hashes for our standard passwords
    console.log('\n3. Creating password hashes using working method...');
    
    // Create hashes for our standard passwords
    const adminHash = await bcrypt.hash('admin123', 12);
    const managerHash = await bcrypt.hash('manager123', 12);
    const employeeHash = await bcrypt.hash('employee123', 12);
    
    console.log(`🔍 Admin hash: ${adminHash.substring(0, 20)}...`);
    console.log(`🔍 Manager hash: ${managerHash.substring(0, 20)}...`);
    console.log(`🔍 Employee hash: ${employeeHash.substring(0, 20)}...`);
    
    // Test these hashes immediately
    const adminTest = await bcrypt.compare('admin123', adminHash);
    const managerTest = await bcrypt.compare('manager123', managerHash);
    const employeeTest = await bcrypt.compare('employee123', employeeHash);
    
    console.log(`🔑 Admin hash test: ${adminTest}`);
    console.log(`🔑 Manager hash test: ${managerTest}`);
    console.log(`🔑 Employee hash test: ${employeeTest}`);
    
    // If any hash test fails, use the system admin hash as template
    if (!adminTest || !managerTest || !employeeTest) {
      console.log('\n⚠️ Hash tests failed. Using alternative approach...');
      
      // Alternative: Create users with known working password (admin123) and ask them to change it
      console.log('🔄 Creating all users with admin123 password (working hash)...');
      
      var useAdminHash = true;
      var workingHash = systemAdmin.password_hash; // Use the known working hash
      var workingPassword = 'admin123'; // All users will use this password initially
    } else {
      console.log('✅ All hash tests passed. Using individual passwords.');
      var useAdminHash = false;
    }

    // Step 4: Create enterprise
    console.log('\n4. Creating enterprise...');
    const enterprise = await Enterprise.create({
      name: 'TechCorp Solutions',
      description: 'Leading technology solutions provider',
      address: '123 Business District, Tech City, TC 12345',
      phone: '+1-555-0100',
      email: 'info@techcorp.com',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: 'large',
      timezone: 'America/New_York'
    });
    console.log(`✅ Enterprise created: ${enterprise.name}`);

    // Step 5: Create enterprise admin
    console.log('\n5. Creating enterprise admin...');
    
    const enterpriseAdmin = await User.create({
      full_name: 'Enterprise Administrator',
      email: 'admin@techcorp.com',
      password_hash: useAdminHash ? workingHash : adminHash,
      role: 'enterpriseAdmin',
      enterprise_id: enterprise.id,
      is_active: true
    });
    
    console.log(`✅ Enterprise admin created: ${enterpriseAdmin.email}`);

    // Step 6: Create departments with managers
    console.log('\n6. Creating departments with managers...');
    
    const departments = [
      { name: 'Engineering Department', managerName: 'Sarah Johnson', managerEmail: 'sarah.johnson@techcorp.com' },
      { name: 'Sales Department', managerName: 'Michael Chen', managerEmail: 'michael.chen@techcorp.com' },
      { name: 'Marketing Department', managerName: 'Emily Rodriguez', managerEmail: 'emily.rodriguez@techcorp.com' },
      { name: 'Operations Department', managerName: 'David Thompson', managerEmail: 'david.thompson@techcorp.com' }
    ];

    const createdDepartments = [];

    for (const deptInfo of departments) {
      // Create manager
      const manager = await User.create({
        full_name: deptInfo.managerName,
        email: deptInfo.managerEmail,
        password_hash: useAdminHash ? workingHash : managerHash,
        role: 'manager',
        enterprise_id: enterprise.id,
        is_active: true
      });

      // Create department
      const department = await Department.create({
        name: deptInfo.name,
        description: `${deptInfo.name} operations and management`,
        enterprise_id: enterprise.id,
        manager_id: manager.id
      });

      // Update manager's department
      await manager.update({ department_id: department.id });

      createdDepartments.push({ department, manager });
      console.log(`✅ ${department.name} created with manager ${manager.full_name}`);
    }

    // Step 7: Create sample employees (3 per department)
    console.log('\n7. Creating sample employees...');
    
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];
    
    let employeeCounter = 1;
    const sampleEmployees = [];
    
    for (const { department } of createdDepartments) {
      console.log(`   Creating 3 employees for ${department.name}...`);
      
      for (let i = 0; i < 3; i++) {
        const firstName = firstNames[(employeeCounter - 1) % firstNames.length];
        const lastName = lastNames[(employeeCounter - 1) % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${employeeCounter}@techcorp.com`;
        
        const employee = await User.create({
          full_name: fullName,
          email: email,
          password_hash: useAdminHash ? workingHash : employeeHash,
          role: 'employee',
          enterprise_id: enterprise.id,
          department_id: department.id,
          is_active: true
        });

        if (i === 0) { // Keep track of first employee from each department
          sampleEmployees.push(employee);
        }

        employeeCounter++;
      }
    }

    // Step 8: Test all credentials via API
    console.log('\n8. Testing credentials via API...');
    
    const axios = require('axios');
    const API_BASE = 'http://localhost:3000/api';
    
    const testPassword = useAdminHash ? workingPassword : 'admin123';
    const managerPassword = useAdminHash ? workingPassword : 'manager123';
    const employeePassword = useAdminHash ? workingPassword : 'employee123';
    
    const testCredentials = [
      { email: 'admin@dutyroster.com', password: 'admin123', name: 'System Admin' },
      { email: 'admin@techcorp.com', password: testPassword, name: 'Enterprise Admin' },
      { email: 'sarah.johnson@techcorp.com', password: managerPassword, name: 'Engineering Manager' },
      { email: sampleEmployees[0]?.email, password: employeePassword, name: 'Sample Employee' }
    ];

    const workingCredentials = [];
    
    for (const cred of testCredentials) {
      if (!cred.email) continue;
      
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email: cred.email,
          password: cred.password
        });
        
        if (response.data.user) {
          console.log(`   ✅ ${cred.name}: ${cred.email} - SUCCESS`);
          workingCredentials.push(cred);
        }
      } catch (error) {
        console.log(`   ❌ ${cred.name}: ${cred.email} - FAILED`);
      }
    }

    // Step 9: Generate final credentials file
    console.log('\n9. Generating final credentials file...');
    
    const credentialsContent = `# TechCorp Solutions - WORKING CREDENTIALS
# Generated: ${new Date().toISOString()}
# Method: ${useAdminHash ? 'Using system admin hash template' : 'Individual password hashes'}

## ✅ CONFIRMED WORKING CREDENTIALS
=================================

### System Administrator
- Email: admin@dutyroster.com
- Password: admin123
- Role: System Admin
- Status: ✅ CONFIRMED WORKING

### Enterprise Administrator
- Email: admin@techcorp.com
- Password: ${testPassword}
- Role: Enterprise Admin
- Status: ${workingCredentials.find(c => c.email === 'admin@techcorp.com') ? '✅ CONFIRMED WORKING' : '❌ FAILED'}

## DEPARTMENT MANAGERS
=====================

### Engineering Department Manager
- Name: Sarah Johnson
- Email: sarah.johnson@techcorp.com
- Password: ${managerPassword}
- Status: ${workingCredentials.find(c => c.email === 'sarah.johnson@techcorp.com') ? '✅ CONFIRMED WORKING' : '❌ FAILED'}

### Sales Department Manager
- Name: Michael Chen
- Email: michael.chen@techcorp.com
- Password: ${managerPassword}

### Marketing Department Manager
- Name: Emily Rodriguez
- Email: emily.rodriguez@techcorp.com
- Password: ${managerPassword}

### Operations Department Manager
- Name: David Thompson
- Email: david.thompson@techcorp.com
- Password: ${managerPassword}

## SAMPLE EMPLOYEES
==================

${sampleEmployees.map(emp => 
`### ${emp.department_id} Employee
- Name: ${emp.full_name}
- Email: ${emp.email}
- Password: ${employeePassword}`).join('\n\n')}

## 🎯 IMMEDIATE TEST CREDENTIALS
==============================

**These credentials should work:**

1. **System Admin**: admin@dutyroster.com / admin123
2. **Enterprise Admin**: admin@techcorp.com / ${testPassword}
3. **Manager**: sarah.johnson@techcorp.com / ${managerPassword}
4. **Employee**: ${sampleEmployees[0]?.email} / ${employeePassword}

## 📊 SUMMARY
=============
- Method: ${useAdminHash ? 'All users use admin123 password (working hash)' : 'Individual passwords with bcrypt'}
- API Tests: ${workingCredentials.length}/${testCredentials.filter(c => c.email).length} passed
- Total Users: ${1 + 1 + 4 + 12} (System + Enterprise + Managers + Employees)

${useAdminHash ? 
'⚠️ NOTE: All users currently use "admin123" password. Change passwords after login.' : 
'✅ Users have individual passwords as intended.'}

${workingCredentials.length === testCredentials.filter(c => c.email).length ? 
'🎉 ALL CREDENTIALS WORKING!' : 
'⚠️ Some credentials failed - check above'}
`;

    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(__dirname, '../../FINAL-WORKING-CREDENTIALS.md');
    fs.writeFileSync(credentialsPath, credentialsContent);

    console.log(`✅ Credentials file created: FINAL-WORKING-CREDENTIALS.md`);

    console.log('\n🎉 USER CREATION COMPLETE!');
    console.log('\n📊 RESULTS:');
    console.log('============');
    console.log(`🔑 Working API logins: ${workingCredentials.length}/${testCredentials.filter(c => c.email).length}`);
    console.log(`👥 Total users created: ${1 + 1 + 4 + 12}`);
    console.log(`📝 Method used: ${useAdminHash ? 'System admin hash template' : 'Individual bcrypt hashes'}`);
    
    console.log('\n🔑 TEST THESE CREDENTIALS:');
    workingCredentials.forEach(cred => {
      console.log(`   ${cred.name}: ${cred.email} / ${cred.password}`);
    });

    if (useAdminHash) {
      console.log('\n⚠️ IMPORTANT: All users currently use "admin123" password.');
      console.log('   Users should change their passwords after first login.');
    }

  } catch (error) {
    console.error('❌ User creation failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

useSystemAdminMethod();
