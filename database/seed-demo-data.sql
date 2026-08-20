USE imps_upi_db;

INSERT INTO accounts (account_number, customer_name, account_type, balance, branch_code, status)
SELECT '123456789012', 'Test Customer', 'Savings', 125000.00, 'BR001', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number='123456789012');

INSERT INTO accounts (account_number, customer_name, account_type, balance, branch_code, status)
SELECT '123456789013', 'Test Customer', 'Current', 250000.00, 'BR001', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number='123456789013');

INSERT INTO beneficiaries (customer_name, account_number, ifsc_code, bank_name, mobile_number, status)
SELECT 'Demo Beneficiary', '987654321098', 'SBIN0001234', 'State Bank Demo', '9876543211', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM beneficiaries WHERE account_number='987654321098');

INSERT INTO notifications (user_id, title, message, notification_type, is_read)
SELECT 1, 'Pending approvals', 'Transactions are waiting for checker approval.', 'TRANSACTION', 0
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title='Pending approvals');

INSERT INTO system_config (config_key, config_value, description)
SELECT 'environment', 'UAT', 'Current application environment'
WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE config_key='environment');

INSERT INTO system_config (config_key, config_value, description)
SELECT 'max_imps_amount', '500000', 'Maximum IMPS amount accepted by application validation'
WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE config_key='max_imps_amount');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-001','100000000001','IMPS','OUTBOUND','123456789012','Test Customer','9876543210',
'987654321098','Demo Beneficiary','SBIN0001234',12500.00,'SUCCESS','BR001','EMP1002','EMP1003','00','Transaction approved','2026-08-18 10:15:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-001');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-002','100000000002','IMPS','OUTBOUND','123456789012','Test Customer','9876543210',
'987654321099','Rahul Patil','HDFC0001234',7500.00,'FAILED','BR001','EMP1002','EMP1003','91','Transaction declined','2026-08-18 11:30:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-002');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-003','100000000003','IMPS','INBOUND','987654321098','Demo Sender','9876543211',
'123456789012','Test Customer','SBIN0001234',15000.00,'SUCCESS','BR001','EMP1003','EMP1003','00','Transaction received','2026-08-18 14:10:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-003');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-004','100000000004','IMPS','OUTBOUND','123456789013','Test Customer','9876543210',
'987654321100','Sneha Kulkarni','ICIC0001234',25000.00,'PENDING','BR001','EMP1002',NULL,NULL,'Awaiting checker approval','2026-08-18 15:20:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-004');

INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks)
SELECT 'TXN-DEMO-004','EMP1002','2026-08-18 15:20:00','PENDING','IMPS transaction approval required'
WHERE NOT EXISTS (SELECT 1 FROM pending_approvals WHERE transaction_id='TXN-DEMO-004' AND status='PENDING');
