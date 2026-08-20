USE imps_upi_db;

INSERT INTO users
(organisation_id, employee_id, employee_name, email, password, branch_code, role, status)
SELECT 'PROGRESSIVE-BANK', 'EMP1003', 'Test Admin', 'admin@progressivebank.com', 'Admin@123', 'BR001', 'Admin', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = 'EMP1003');

INSERT INTO users
(organisation_id, employee_id, employee_name, email, password, branch_code, role, status)
SELECT 'PROGRESSIVE-BANK', 'EMP1004', 'Test Checker', 'checker@progressivebank.com', 'Checker@123', 'BR001', 'Checker', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = 'EMP1004');
