-- Sample data for testing the duty roster management system
-- This file creates sample enterprises, users, departments, and related data

-- Insert sample enterprises first

-- Insert sample enterprises
INSERT INTO enterprises (name, description, is_active, created_at, updated_at) VALUES
('TechCorp Solutions', 'Leading technology consulting company', true, NOW() - INTERVAL '6 months', NOW()),
('HealthCare Plus', 'Modern healthcare facility network', true, NOW() - INTERVAL '4 months', NOW()),
('RetailMax Chain', 'National retail chain operations', true, NOW() - INTERVAL '3 months', NOW()),
('Manufacturing Pro', 'Industrial manufacturing company', false, NOW() - INTERVAL '8 months', NOW());

-- Insert sample departments
INSERT INTO departments (name, description, enterprise_id, created_at, updated_at) VALUES
-- TechCorp Solutions departments
('IT Support', 'Technical support and helpdesk', 1, NOW() - INTERVAL '6 months', NOW()),
('Development', 'Software development team', 1, NOW() - INTERVAL '5 months', NOW()),
('Operations', 'Business operations and management', 1, NOW() - INTERVAL '4 months', NOW()),

-- HealthCare Plus departments
('Emergency', 'Emergency room operations', 2, NOW() - INTERVAL '4 months', NOW()),
('Nursing', 'Patient care and nursing staff', 2, NOW() - INTERVAL '3 months', NOW()),
('Administration', 'Hospital administration', 2, NOW() - INTERVAL '3 months', NOW()),

-- RetailMax Chain departments
('Sales Floor', 'Customer service and sales', 3, NOW() - INTERVAL '3 months', NOW()),
('Warehouse', 'Inventory and logistics', 3, NOW() - INTERVAL '2 months', NOW()),
('Management', 'Store management team', 3, NOW() - INTERVAL '2 months', NOW()),

-- Manufacturing Pro departments (inactive enterprise)
('Production', 'Manufacturing floor operations', 4, NOW() - INTERVAL '8 months', NOW()),
('Quality Control', 'Product quality assurance', 4, NOW() - INTERVAL '7 months', NOW());

-- Insert sample users
INSERT INTO users (full_name, email, password_hash, role, enterprise_id, department_id, is_active, created_at, updated_at) VALUES
-- System Admin
('System Administrator', 'admin@system.com', '$2b$10$example_hash_for_password123', 'systemAdmin', NULL, NULL, true, NOW() - INTERVAL '1 year', NOW()),

-- TechCorp Solutions users
('John Smith', 'john.smith@techcorp.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 1, NULL, true, NOW() - INTERVAL '6 months', NOW()),
('Alice Johnson', 'alice.johnson@techcorp.com', '$2b$10$example_hash_for_password123', 'manager', 1, 1, true, NOW() - INTERVAL '5 months', NOW()),
('Bob Wilson', 'bob.wilson@techcorp.com', '$2b$10$example_hash_for_password123', 'manager', 1, 2, true, NOW() - INTERVAL '5 months', NOW()),
('Carol Davis', 'carol.davis@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 1, 1, true, NOW() - INTERVAL '4 months', NOW()),
('David Brown', 'david.brown@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 1, 1, true, NOW() - INTERVAL '4 months', NOW()),
('Eve Miller', 'eve.miller@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 1, 2, true, NOW() - INTERVAL '3 months', NOW()),
('Frank Garcia', 'frank.garcia@techcorp.com', '$2b$10$example_hash_for_password123', 'employee', 1, 2, false, NOW() - INTERVAL '3 months', NOW()),

-- HealthCare Plus users
('Dr. Sarah Connor', 'sarah.connor@healthcare.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 2, NULL, true, NOW() - INTERVAL '4 months', NOW()),
('Nurse Manager Lisa', 'lisa.manager@healthcare.com', '$2b$10$example_hash_for_password123', 'manager', 2, 4, true, NOW() - INTERVAL '3 months', NOW()),
('Dr. Michael Chen', 'michael.chen@healthcare.com', '$2b$10$example_hash_for_password123', 'employee', 2, 4, true, NOW() - INTERVAL '3 months', NOW()),
('Nurse Jennifer Lee', 'jennifer.lee@healthcare.com', '$2b$10$example_hash_for_password123', 'employee', 2, 5, true, NOW() - INTERVAL '2 months', NOW()),
('Admin Robert Kim', 'robert.kim@healthcare.com', '$2b$10$example_hash_for_password123', 'employee', 2, 6, true, NOW() - INTERVAL '2 months', NOW()),

-- RetailMax Chain users
('Store Director Tom', 'tom.director@retailmax.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 3, NULL, true, NOW() - INTERVAL '3 months', NOW()),
('Sales Manager Amy', 'amy.sales@retailmax.com', '$2b$10$example_hash_for_password123', 'manager', 3, 7, true, NOW() - INTERVAL '2 months', NOW()),
('Warehouse Manager Joe', 'joe.warehouse@retailmax.com', '$2b$10$example_hash_for_password123', 'manager', 3, 8, true, NOW() - INTERVAL '2 months', NOW()),
('Sales Associate Mary', 'mary.sales@retailmax.com', '$2b$10$example_hash_for_password123', 'employee', 3, 7, true, NOW() - INTERVAL '1 month', NOW()),
('Warehouse Worker Steve', 'steve.warehouse@retailmax.com', '$2b$10$example_hash_for_password123', 'employee', 3, 8, true, NOW() - INTERVAL '1 month', NOW()),

-- Manufacturing Pro users (inactive enterprise)
('Plant Manager Bill', 'bill.manager@manufacturing.com', '$2b$10$example_hash_for_password123', 'enterpriseAdmin', 4, NULL, false, NOW() - INTERVAL '8 months', NOW()),
('Production Lead Kate', 'kate.production@manufacturing.com', '$2b$10$example_hash_for_password123', 'manager', 4, 10, false, NOW() - INTERVAL '7 months', NOW()),
('QC Inspector Dan', 'dan.qc@manufacturing.com', '$2b$10$example_hash_for_password123', 'employee', 4, 11, false, NOW() - INTERVAL '6 months', NOW());

-- Update departments with manager assignments
UPDATE departments SET manager_id = 3 WHERE id = 1; -- Alice manages IT Support
UPDATE departments SET manager_id = 4 WHERE id = 2; -- Bob manages Development
UPDATE departments SET manager_id = 10 WHERE id = 4; -- Lisa manages Emergency
UPDATE departments SET manager_id = 15 WHERE id = 7; -- Amy manages Sales Floor
UPDATE departments SET manager_id = 16 WHERE id = 8; -- Joe manages Warehouse
UPDATE departments SET manager_id = 21 WHERE id = 10; -- Kate manages Production

-- Insert sample rosters
INSERT INTO rosters (name, description, start_date, end_date, status, department_id, created_by, created_at, updated_at) VALUES
('IT Support - Week 1', 'Weekly IT support coverage', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'published', 1, 3, NOW() - INTERVAL '2 weeks', NOW()),
('Development - Sprint 1', 'Development team sprint coverage', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '14 days', 'draft', 2, 4, NOW() - INTERVAL '1 week', NOW()),
('Emergency - Night Shifts', 'Emergency room night shift coverage', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'published', 4, 10, NOW() - INTERVAL '3 weeks', NOW()),
('Sales Floor - Holiday', 'Holiday season sales coverage', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '21 days', 'review', 7, 15, NOW() - INTERVAL '5 days', NOW());

-- Insert sample shifts
INSERT INTO shifts (date, start_time, end_time, shift_type, description, department_id, roster_id, created_at, updated_at) VALUES
-- IT Support shifts
(CURRENT_DATE, '09:00:00', '17:00:00', 'morning', 'Morning IT support', 1, 1, NOW() - INTERVAL '2 weeks', NOW()),
(CURRENT_DATE, '17:00:00', '01:00:00', 'night', 'Night IT support', 1, 1, NOW() - INTERVAL '2 weeks', NOW()),
(CURRENT_DATE + INTERVAL '1 day', '09:00:00', '17:00:00', 'morning', 'Morning IT support', 1, 1, NOW() - INTERVAL '2 weeks', NOW()),

-- Emergency shifts
(CURRENT_DATE, '22:00:00', '06:00:00', 'night', 'Emergency night shift', 4, 3, NOW() - INTERVAL '3 weeks', NOW()),
(CURRENT_DATE + INTERVAL '1 day', '22:00:00', '06:00:00', 'night', 'Emergency night shift', 4, 3, NOW() - INTERVAL '3 weeks', NOW()),
(CURRENT_DATE + INTERVAL '2 days', '22:00:00', '06:00:00', 'night', 'Emergency night shift', 4, 3, NOW() - INTERVAL '3 weeks', NOW()),

-- Sales Floor shifts
(CURRENT_DATE + INTERVAL '7 days', '10:00:00', '18:00:00', 'morning', 'Sales floor coverage', 7, 4, NOW() - INTERVAL '5 days', NOW()),
(CURRENT_DATE + INTERVAL '7 days', '18:00:00', '22:00:00', 'evening', 'Evening sales coverage', 7, 4, NOW() - INTERVAL '5 days', NOW());

-- Insert sample shift assignments
INSERT INTO shift_assignments (shift_id, employee_id, status, assigned_at, created_at, updated_at) VALUES
-- IT Support assignments
(1, 5, 'confirmed', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', NOW()),
(2, 6, 'confirmed', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', NOW()),
(3, 5, 'pending', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NOW()),

-- Emergency assignments
(4, 11, 'confirmed', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks', NOW()),
(5, 11, 'confirmed', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks', NOW()),
(6, 11, 'declined', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', NOW()),

-- Sales assignments
(7, 17, 'pending', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
(8, 17, 'confirmed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW());

-- Insert sample swap requests
INSERT INTO swap_requests (requester_id, target_employee_id, original_shift_id, requested_shift_id, reason, status, department_id, created_at, updated_at) VALUES
(5, 6, 1, 2, 'Family emergency, need to swap shifts', 'approved', 1, NOW() - INTERVAL '1 week', NOW() - INTERVAL '5 days'),
(11, 12, 4, 5, 'Doctor appointment conflict', 'pending', 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(17, 18, 7, 8, 'Personal commitment', 'rejected', 7, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

-- Insert sample availability (using correct schema)
INSERT INTO availability (employee_id, date, day_of_week, availability_type, start_time, end_time, created_at, updated_at) VALUES
(5, CURRENT_DATE + INTERVAL '1 day', EXTRACT(DOW FROM CURRENT_DATE + INTERVAL '1 day'), 'available', '09:00:00', '17:00:00', NOW() - INTERVAL '1 week', NOW()),
(6, CURRENT_DATE + INTERVAL '1 day', EXTRACT(DOW FROM CURRENT_DATE + INTERVAL '1 day'), 'available', '17:00:00', '23:59:59', NOW() - INTERVAL '1 week', NOW()),
(11, CURRENT_DATE + INTERVAL '3 days', EXTRACT(DOW FROM CURRENT_DATE + INTERVAL '3 days'), 'unavailable', '22:00:00', '06:00:00', NOW() - INTERVAL '5 days', NOW()),
(17, CURRENT_DATE + INTERVAL '7 days', EXTRACT(DOW FROM CURRENT_DATE + INTERVAL '7 days'), 'available', '10:00:00', '22:00:00', NOW() - INTERVAL '3 days', NOW());

-- Insert sample notifications (using correct schema)
INSERT INTO notifications (user_id, title, message, type, read_at, created_at, updated_at) VALUES
(5, 'Shift Assignment', 'You have been assigned to IT Support morning shift', 'shift_assignment', NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 weeks', NOW()),
(6, 'Swap Request Approved', 'Your shift swap request has been approved', 'swap_request', NULL, NOW() - INTERVAL '5 days', NOW()),
(11, 'New Roster Published', 'Emergency department roster has been published', 'roster_update', NULL, NOW() - INTERVAL '3 weeks', NOW()),
(17, 'Shift Reminder', 'You have an upcoming shift tomorrow', 'reminder', NULL, NOW() - INTERVAL '1 day', NOW());

-- Verify the data was inserted
SELECT 'Data insertion completed successfully!' as status;
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
FROM rosters
UNION ALL
SELECT 
    'Shifts: ' || COUNT(*) 
FROM shifts;
