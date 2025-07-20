-- Remove all sample data except system admin user
-- This script will clean the database while preserving the system admin account

-- Start transaction to ensure data integrity
BEGIN;

-- First, get the system admin user ID for reference
DO $$
DECLARE
    system_admin_id INTEGER;
BEGIN
    -- Get system admin user ID
    SELECT id INTO system_admin_id FROM users WHERE role = 'systemAdmin' AND email = 'admin@system.com';
    
    IF system_admin_id IS NULL THEN
        RAISE EXCEPTION 'System admin user not found! Cannot proceed with cleanup.';
    END IF;
    
    RAISE NOTICE 'System admin user ID: %', system_admin_id;
END $$;

-- Delete data in correct order to respect foreign key constraints

-- 1. Delete notifications (except for system admin)
DELETE FROM notifications WHERE user_id != (SELECT id FROM users WHERE role = 'systemAdmin' AND email = 'admin@system.com');

-- 2. Delete notification preferences (except for system admin)
DELETE FROM notification_preferences WHERE user_id != (SELECT id FROM users WHERE role = 'systemAdmin' AND email = 'admin@system.com');

-- 3. Delete availability records (except for system admin)
DELETE FROM availability WHERE employee_id != (SELECT id FROM users WHERE role = 'systemAdmin' AND email = 'admin@system.com');

-- 4. Delete swap requests
DELETE FROM swap_requests;

-- 5. Delete shift assignments
DELETE FROM shift_assignments;

-- 6. Delete shifts
DELETE FROM shifts;

-- 7. Delete rosters
DELETE FROM rosters;

-- 8. Delete users (except system admin)
DELETE FROM users WHERE role != 'systemAdmin' OR email != 'admin@system.com';

-- 9. Delete departments
DELETE FROM departments;

-- 10. Delete enterprises
DELETE FROM enterprises;

-- Reset sequences to start from 1 (except users sequence which should continue from system admin ID)
ALTER SEQUENCE enterprises_id_seq RESTART WITH 1;
ALTER SEQUENCE departments_id_seq RESTART WITH 1;
ALTER SEQUENCE rosters_id_seq RESTART WITH 1;
ALTER SEQUENCE shifts_id_seq RESTART WITH 1;
ALTER SEQUENCE shift_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE swap_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE availability_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- Don't reset users sequence to preserve system admin ID

-- Verify cleanup
DO $$
DECLARE
    remaining_users INTEGER;
    remaining_enterprises INTEGER;
    remaining_departments INTEGER;
    remaining_rosters INTEGER;
    remaining_shifts INTEGER;
    system_admin_email TEXT;
BEGIN
    -- Count remaining records
    SELECT COUNT(*) INTO remaining_users FROM users;
    SELECT COUNT(*) INTO remaining_enterprises FROM enterprises;
    SELECT COUNT(*) INTO remaining_departments FROM departments;
    SELECT COUNT(*) INTO remaining_rosters FROM rosters;
    SELECT COUNT(*) INTO remaining_shifts FROM shifts;
    
    -- Get system admin email for verification
    SELECT email INTO system_admin_email FROM users WHERE role = 'systemAdmin';
    
    -- Display cleanup results
    RAISE NOTICE '=== CLEANUP RESULTS ===';
    RAISE NOTICE 'Remaining users: % (should be 1)', remaining_users;
    RAISE NOTICE 'System admin email: %', system_admin_email;
    RAISE NOTICE 'Remaining enterprises: % (should be 0)', remaining_enterprises;
    RAISE NOTICE 'Remaining departments: % (should be 0)', remaining_departments;
    RAISE NOTICE 'Remaining rosters: % (should be 0)', remaining_rosters;
    RAISE NOTICE 'Remaining shifts: % (should be 0)', remaining_shifts;
    
    -- Verify system admin still exists
    IF remaining_users != 1 OR system_admin_email != 'admin@system.com' THEN
        RAISE EXCEPTION 'Cleanup failed! System admin user not properly preserved.';
    END IF;
    
    RAISE NOTICE 'Database cleanup completed successfully!';
    RAISE NOTICE 'Only system admin user (admin@system.com) remains in the database.';
END $$;

-- Commit the transaction
COMMIT;

-- Final verification query
SELECT 
    'Database cleaned successfully!' as status,
    (SELECT COUNT(*) FROM users) as remaining_users,
    (SELECT COUNT(*) FROM enterprises) as remaining_enterprises,
    (SELECT COUNT(*) FROM departments) as remaining_departments,
    (SELECT COUNT(*) FROM rosters) as remaining_rosters,
    (SELECT COUNT(*) FROM shifts) as remaining_shifts,
    (SELECT email FROM users WHERE role = 'systemAdmin') as system_admin_email;
