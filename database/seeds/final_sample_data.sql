-- Final working sample data

-- Insert sample departments using the correct enterprise IDs
INSERT INTO departments (name, description, enterprise_id, created_at, updated_at) VALUES
-- TechCorp Solutions departments (enterprise_id = 5)
('IT Support', 'Technical support and helpdesk', 5, NOW() - INTERVAL '6 months', NOW()),
('Development', 'Software development team', 5, NOW() - INTERVAL '5 months', NOW()),
('Operations', 'Business operations and management', 5, NOW() - INTERVAL '4 months', NOW()),

-- HealthCare Plus departments (enterprise_id = 6)
('Emergency', 'Emergency room operations', 6, NOW() - INTERVAL '4 months', NOW()),
('Nursing', 'Patient care and nursing staff', 6, NOW() - INTERVAL '3 months', NOW()),
('Administration', 'Hospital administration', 6, NOW() - INTERVAL '3 months', NOW()),

-- RetailMax Chain departments (enterprise_id = 7)
('Sales Floor', 'Customer service and sales', 7, NOW() - INTERVAL '3 months', NOW()),
('Warehouse', 'Inventory and logistics', 7, NOW() - INTERVAL '2 months', NOW()),
('Management', 'Store management team', 7, NOW() - INTERVAL '2 months', NOW()),

-- Manufacturing Pro departments (enterprise_id = 8)
('Production', 'Manufacturing floor operations', 8, NOW() - INTERVAL '8 months', NOW()),
('Quality Control', 'Product quality assurance', 8, NOW() - INTERVAL '7 months', NOW());

-- Insert sample users using the correct enterprise and department IDs
INSERT INTO users (full_name, email, password_hash, role, enterprise_id, department_id, is_active, created_at, updated_at) VALUES
-- System Admin
('System Administrator', 'admin@system.com', '$2b$10$example_hash_for_password123', 'systemAdmin', NULL, NULL, true, NOW() - INTERVAL '1 year', NOW()),

-- TechCorp Solutions users (enterprise_id = 5)
('John Smith', 'john.smith@techcorp.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 5, NULL, true, NOW() - INTERVAL '6 months', NOW()),
('Alice Johnson', 'alice.johnson@techcorp.com', '$2b$10$example_hash_for_password123', 'manager', 5, 1, true, NOW() - INTERVAL '5 months', NOW()),
('Bob Wilson', 'bob.wilson@techcorp.com', '$2b$10$example_hash_for_password123', 'manager', 5, 2, true, NOW() - INTERVAL '5 months', NOW()),
('Carol Davis', 'carol.davis@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 5, 1, true, NOW() - INTERVAL '4 months', NOW()),
('David Brown', 'david.brown@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 5, 1, true, NOW() - INTERVAL '4 months', NOW()),
('Eve Miller', 'eve.miller@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 5, 2, true, NOW() - INTERVAL '3 months', NOW()),
('Frank Garcia', 'frank.garcia@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 5, 2, false, NOW() - INTERVAL '3 months', NOW()),

-- HealthCare Plus users (enterprise_id = 6)
('Dr. Sarah Connor', 'sarah.connor@healthcare.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 6, NULL, true, NOW() - INTERVAL '4 months', NOW()),
('Nurse Manager Lisa', 'lisa.manager@healthcare.com', '$2b$10$example_hash_for_password123', 'manager', 6, 4, true, NOW() - INTERVAL '3 months', NOW()),
('Dr. Michael Chen', 'michael.chen@healthcare.com', '$2b$10$example_hash_for_password123', 'employee', 6, 4, true, NOW() - INTERVAL '3 months', NOW()),
('Nurse Jennifer Lee', 'jennifer.lee@healthcare.com', '$2b$10$example_hash_for_password123', 'employee', 6, 5, true, NOW() - INTERVAL '2 months', NOW()),
('Admin Robert Kim', 'robert.kim@healthcare.com', '$2b$10$example_hash_for_password123', 'employee', 6, 6, true, NOW() - INTERVAL '2 months', NOW()),

-- RetailMax Chain users (enterprise_id = 7)
('Store Director Tom', 'tom.director@retailmax.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 7, NULL, true, NOW() - INTERVAL '3 months', NOW()),
('Sales Manager Amy', 'amy.sales@retailmax.com', '$2b$10$example_hash_for_password123', 'manager', 7, 7, true, NOW() - INTERVAL '2 months', NOW()),
('Warehouse Manager Joe', 'joe.warehouse@retailmax.com', '$2b$10$example_hash_for_password123', 'manager', 7, 8, true, NOW() - INTERVAL '2 months', NOW()),
('Sales Associate Mary', 'mary.sales@retailmax.com', '$2b$10$example_hash_for_password123', 'employee', 7, 7, true, NOW() - INTERVAL '1 month', NOW()),
('Warehouse Worker Steve', 'steve.warehouse@retailmax.com', '$2b$10$example_hash_for_password123', 'employee', 7, 8, true, NOW() - INTERVAL '1 month', NOW()),

-- Manufacturing Pro users (enterprise_id = 8)
('Plant Manager Bill', 'bill.manager@manufacturing.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 8, NULL, false, NOW() - INTERVAL '8 months', NOW()),
('Production Lead Kate', 'kate.production@manufacturing.com', '$2b$10$example_hash_for_password123', 'manager', 8, 10, false, NOW() - INTERVAL '7 months', NOW()),
('QC Inspector Dan', 'dan.qc@manufacturing.com', '$2b$10$example_hash_for_password123', 'employee', 8, 11, false, NOW() - INTERVAL '6 months', NOW());

-- Update departments with manager assignments (using correct user IDs)
UPDATE departments SET manager_id = 3 WHERE id = 1; -- Alice manages IT Support
UPDATE departments SET manager_id = 4 WHERE id = 2; -- Bob manages Development
UPDATE departments SET manager_id = 10 WHERE id = 4; -- Lisa manages Emergency
UPDATE departments SET manager_id = 15 WHERE id = 7; -- Amy manages Sales Floor
UPDATE departments SET manager_id = 16 WHERE id = 8; -- Joe manages Warehouse
UPDATE departments SET manager_id = 21 WHERE id = 10; -- Kate manages Production

-- Insert a few basic rosters
INSERT INTO rosters (name, start_date, end_date, status, department_id, created_by, created_at, updated_at) VALUES
('IT Support - Week 1', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'published', 1, 3, NOW() - INTERVAL '2 weeks', NOW()),
('Development - Sprint 1', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '14 days', 'draft', 2, 4, NOW() - INTERVAL '1 week', NOW()),
('Emergency - Night Shifts', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'published', 4, 10, NOW() - INTERVAL '3 weeks', NOW()),
('Sales Floor - Holiday', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '21 days', 'review', 7, 15, NOW() - INTERVAL '5 days', NOW());

-- Verify the data was inserted
SELECT 'Final data insertion completed successfully!' as status;
SELECT 
    'Enterprises: ' || COUNT(*) as summary 
FROM enterprises
UNION ALL
SELECT 
    'Departments: ' || COUNT(*) 
FROM departments
UNION ALL
SELECT 
    'Users: ' || COUNT(*) 
FROM users
UNION ALL
SELECT 
    'Rosters: ' || COUNT(*) 
FROM rosters;
