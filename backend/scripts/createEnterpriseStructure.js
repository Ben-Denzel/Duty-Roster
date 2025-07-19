const bcrypt = require('bcrypt');
const { sequelize } = require('../src/config/database');
const { User, Enterprise, Department } = require('../src/models');

async function createEnterpriseStructure() {
  try {
    console.log('🏢 Creating Enterprise Structure...\n');

    // Step 1: Create Enterprise
    console.log('1. Creating Enterprise...');
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
        },
        shift_patterns: {
          morning: { start: '06:00', end: '14:00', enabled: true },
          afternoon: { start: '14:00', end: '22:00', enabled: true },
          night: { start: '22:00', end: '06:00', enabled: true }
        },
        policies: {
          max_consecutive_days: 7,
          min_rest_hours: 12,
          allow_overtime: true,
          require_manager_approval: true
        }
      }
    });
    console.log(`✅ Enterprise created: ${enterprise.name} (ID: ${enterprise.id})`);

    // Step 2: Create Enterprise Admin
    console.log('\n2. Creating Enterprise Admin...');
    const enterpriseAdmin = await User.create({
      full_name: 'Enterprise Administrator',
      email: 'admin@techcorp.com',
      password_hash: await bcrypt.hash('admin123', 10),
      role: 'enterpriseAdmin',
      enterprise_id: enterprise.id,
      is_active: true
    });
    console.log(`✅ Enterprise Admin created: ${enterpriseAdmin.full_name}`);

    // Step 3: Create 4 Departments with Managers
    console.log('\n3. Creating 4 Departments with Managers...');
    
    const departments = [
      {
        name: 'Engineering Department',
        description: 'Software development and technical operations',
        managerName: 'Sarah Johnson',
        managerEmail: 'sarah.johnson@techcorp.com'
      },
      {
        name: 'Sales Department', 
        description: 'Sales and customer acquisition',
        managerName: 'Michael Chen',
        managerEmail: 'michael.chen@techcorp.com'
      },
      {
        name: 'Marketing Department',
        description: 'Marketing and brand management',
        managerName: 'Emily Rodriguez',
        managerEmail: 'emily.rodriguez@techcorp.com'
      },
      {
        name: 'Operations Department',
        description: 'Operations and logistics management',
        managerName: 'David Thompson',
        managerEmail: 'david.thompson@techcorp.com'
      }
    ];

    const createdDepartments = [];
    const allUsers = [
      {
        full_name: 'System Administrator',
        email: 'admin@dutyroster.com',
        password: 'admin123',
        role: 'systemAdmin',
        enterprise: 'System',
        department: 'System'
      },
      {
        full_name: enterpriseAdmin.full_name,
        email: enterpriseAdmin.email,
        password: 'admin123',
        role: 'enterpriseAdmin',
        enterprise: enterprise.name,
        department: 'Enterprise Level'
      }
    ];

    for (let i = 0; i < departments.length; i++) {
      const deptInfo = departments[i];
      
      // Create department manager first
      const manager = await User.create({
        full_name: deptInfo.managerName,
        email: deptInfo.managerEmail,
        password_hash: await bcrypt.hash('manager123', 10),
        role: 'manager',
        enterprise_id: enterprise.id,
        is_active: true
      });

      // Create department
      const department = await Department.create({
        name: deptInfo.name,
        description: deptInfo.description,
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
        },
        shift_patterns: {
          morning: { start: '06:00', end: '14:00', enabled: true },
          afternoon: { start: '14:00', end: '22:00', enabled: true },
          night: { start: '22:00', end: '06:00', enabled: true }
        },
        settings: {
          max_consecutive_days: 7,
          min_rest_hours: 12,
          allow_overtime: true,
          require_manager_approval: true
        }
      });

      // Update manager's department_id
      await manager.update({ department_id: department.id });

      createdDepartments.push({ department, manager });
      
      // Add manager to users list
      allUsers.push({
        full_name: manager.full_name,
        email: manager.email,
        password: 'manager123',
        role: 'manager',
        enterprise: enterprise.name,
        department: department.name
      });

      console.log(`✅ Department created: ${department.name} with manager ${manager.full_name}`);
    }

    console.log('\n4. Creating 20 employees per department...');
    
    // Employee name templates
    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
      'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
      'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
      'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
      'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen',
      'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
      'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
      'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
      'Benjamin', 'Dorothy', 'Samuel', 'Lisa', 'Gregory', 'Nancy', 'Alexander', 'Karen',
      'Patrick', 'Betty', 'Frank', 'Helen', 'Raymond', 'Sandra', 'Jack', 'Donna'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
      'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
      'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
    ];

    let employeeCounter = 1;

    for (const { department } of createdDepartments) {
      console.log(`   Creating employees for ${department.name}...`);
      
      for (let j = 0; j < 20; j++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${employeeCounter}@techcorp.com`;
        
        const employee = await User.create({
          full_name: fullName,
          email: email,
          password_hash: await bcrypt.hash('employee123', 10),
          role: 'employee',
          enterprise_id: enterprise.id,
          department_id: department.id,
          is_active: true
        });

        allUsers.push({
          full_name: employee.full_name,
          email: employee.email,
          password: 'employee123',
          role: 'employee',
          enterprise: enterprise.name,
          department: department.name
        });

        employeeCounter++;
      }
      
      console.log(`   ✅ 20 employees created for ${department.name}`);
    }

    console.log('\n5. Generating credentials file...');
    
    // Generate credentials file content
    let credentialsContent = `# TechCorp Solutions - User Credentials
# Generated on: ${new Date().toISOString()}
# Total Users: ${allUsers.length}

## SYSTEM LEVEL
================

### System Administrator
- Name: System Administrator
- Email: admin@dutyroster.com
- Password: admin123
- Role: System Admin
- Access: Full system access

## ENTERPRISE LEVEL
==================

### Enterprise Administrator
- Name: Enterprise Administrator  
- Email: admin@techcorp.com
- Password: admin123
- Role: Enterprise Admin
- Enterprise: TechCorp Solutions
- Access: Full enterprise access

## DEPARTMENT MANAGERS
=====================

`;

    // Add managers
    const managers = allUsers.filter(u => u.role === 'manager');
    managers.forEach((manager, index) => {
      credentialsContent += `### ${manager.department} Manager
- Name: ${manager.full_name}
- Email: ${manager.email}
- Password: ${manager.password}
- Role: Manager
- Department: ${manager.department}
- Access: Department management

`;
    });

    credentialsContent += `## EMPLOYEES BY DEPARTMENT
=========================

`;

    // Add employees by department
    const employees = allUsers.filter(u => u.role === 'employee');
    const employeesByDept = {};
    
    employees.forEach(emp => {
      if (!employeesByDept[emp.department]) {
        employeesByDept[emp.department] = [];
      }
      employeesByDept[emp.department].push(emp);
    });

    Object.entries(employeesByDept).forEach(([deptName, deptEmployees]) => {
      credentialsContent += `### ${deptName} (${deptEmployees.length} employees)

`;
      deptEmployees.forEach((emp, index) => {
        credentialsContent += `${index + 1}. ${emp.full_name}
   Email: ${emp.email}
   Password: ${emp.password}

`;
      });
    });

    credentialsContent += `## QUICK REFERENCE
==================

### Login Patterns:
- System Admin: admin@dutyroster.com / admin123
- Enterprise Admin: admin@techcorp.com / admin123  
- Managers: [manager-email] / manager123
- Employees: [employee-email] / employee123

### Total Count:
- System Admin: 1
- Enterprise Admin: 1
- Managers: 4
- Employees: 80
- **Total Users: 86**

### Departments:
1. Engineering Department (Manager: Sarah Johnson)
2. Sales Department (Manager: Michael Chen)  
3. Marketing Department (Manager: Emily Rodriguez)
4. Operations Department (Manager: David Thompson)

Each department has 20 employees with unique names and email addresses.
`;

    // Write credentials file
    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(__dirname, '../../user-credentials.md');
    fs.writeFileSync(credentialsPath, credentialsContent);

    console.log(`✅ Credentials file created: ${credentialsPath}`);

    // Final summary
    console.log('\n🎉 Enterprise Structure Created Successfully!');
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`🏢 Enterprise: ${enterprise.name}`);
    console.log(`👑 Enterprise Admin: admin@techcorp.com`);
    console.log(`🏬 Departments: 4`);
    console.log(`👨‍💼 Managers: 4`);
    console.log(`👥 Employees: 80`);
    console.log(`📋 Total Users: 86`);
    console.log(`📄 Credentials File: user-credentials.md`);

  } catch (error) {
    console.error('❌ Failed to create enterprise structure:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createEnterpriseStructure();
