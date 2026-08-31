const { pool } = require('../config/database');
const { patterns, clean, required, validAmount } = require('../utils/validation');

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM transactions ORDER BY transaction_date DESC, id DESC`);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transactionId = clean(req.params.transactionId);
    if (!patterns.transactionId.test(transactionId) && !patterns.rrn.test(transactionId)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }
    const [rows] = await pool.query(`SELECT * FROM transactions WHERE transaction_id = ? OR rrn = ? LIMIT 1`, [transactionId, transactionId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction.' });
  }
};

const createTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const transactionType = clean(req.body.transactionType).toUpperCase() || 'IMPS';
    const direction = clean(req.body.direction).toUpperCase() || 'OUTBOUND';
    const senderAccount = clean(req.body.senderAccount).toUpperCase();
    const senderName = clean(req.body.senderName);
    const senderMobile = clean(req.body.senderMobile) || '9876543210';
    const beneficiaryAccount = clean(req.body.beneficiaryAccount).toUpperCase();
    const beneficiaryName = clean(req.body.beneficiaryName);
    const beneficiaryIfsc = clean(req.body.beneficiaryIfsc).toUpperCase();
    const amount = Number(req.body.amount);
    const purpose = clean(req.body.purpose) || 'Personal';
    const remarks = clean(req.body.remarks);
    const branchCode = clean(req.body.branchCode).toUpperCase() || 'BR001';
    const initiatedBy = clean(req.body.initiatedBy) || 'SYSTEM';

    if (transactionType !== 'IMPS') throw validationError('Transaction type must be IMPS.');
    if (!['OUTBOUND', 'INBOUND'].includes(direction)) throw validationError('Invalid transaction direction.');
    if (!patterns.account.test(senderAccount)) throw validationError('Enter a valid sender account number.');
    if (senderName && !patterns.name.test(senderName)) throw validationError('Enter a valid sender name.');
    if (!patterns.mobile.test(senderMobile)) throw validationError('Enter a valid 10-digit sender mobile number.');
    if (!patterns.account.test(beneficiaryAccount)) throw validationError('Enter a valid beneficiary account number.');
    if (!patterns.name.test(beneficiaryName)) throw validationError('Enter a valid beneficiary name.');
    if (!patterns.ifsc.test(beneficiaryIfsc)) throw validationError('Enter a valid 11-character IFSC code.');
    if (!validAmount(amount)) throw validationError('Amount must be greater than zero and not exceed ₹5,00,000.');
    if (!['Personal', 'Education', 'Medical', 'Business', 'Other'].includes(purpose)) throw validationError('Select a valid transaction purpose.');
    if (remarks.length > 200) throw validationError('Remarks cannot exceed 200 characters.');
    if (branchCode && !patterns.branchCode.test(branchCode)) throw validationError('Invalid branch code.');

    await connection.beginTransaction();

    // 1. Verify sender account and check balance availability
    const [senderRows] = await connection.query(
      `SELECT id, account_number, customer_name, balance, status, branch_code
       FROM accounts
       WHERE account_number = ?
       FOR UPDATE`,
      [senderAccount]
    );

    if (!senderRows.length) {
      throw validationError(`Debit account ${senderAccount} not found in banking database.`);
    }

    const sender = senderRows[0];
    if (String(sender.status).toUpperCase() !== 'ACTIVE') {
      throw validationError(`Debit account ${senderAccount} is ${sender.status}. Transfer not permitted.`);
    }

    const currentSenderBalance = Number(sender.balance || 0);
    if (currentSenderBalance < amount) {
      throw validationError(
        `Insufficient balance. Available: ₹${currentSenderBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Required: ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      );
    }

    // 2. Generate transaction identifiers
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const rrn = `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-12);
    const msg = `Transfer request for ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} submitted. Status: In Process (Sent for Checker Approval).`;

    // 3. Insert transaction record with status PENDING (In Process)
    const [result] = await connection.query(
      `INSERT INTO transactions
       (transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
        beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status,
        branch_code, initiated_by, response_code, response_message, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, 'IP', ?, NOW())`,
      [
        transactionId,
        rrn,
        transactionType,
        direction,
        senderAccount,
        sender.customer_name || senderName || 'Valued Customer',
        senderMobile,
        beneficiaryAccount,
        beneficiaryName,
        beneficiaryIfsc,
        amount,
        sender.branch_code || branchCode || 'BR001',
        initiatedBy,
        remarks || msg
      ]
    );

    // 4. Insert into pending_approvals table so it appears in the Approvals Tab
    await connection.query(
      `INSERT INTO pending_approvals
       (transaction_id, requested_by, requested_at, status, remarks)
       VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`,
      [
        transactionId,
        initiatedBy,
        remarks || 'IMPS transfer requires maker-checker approval'
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: msg,
      data: {
        id: result.insertId,
        transactionId,
        rrn,
        status: 'In Process',
        amount,
        senderAccount,
        beneficiaryAccount,
        beneficiaryName
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create transaction.'
    });
  } finally {
    connection.release();
  }
};

const searchTransactions = async (req, res) => {
  try {
    const transactionId = clean(req.query.transactionId);
    const rrn = clean(req.query.rrn);
    const account = clean(req.query.account);
    const mobile = clean(req.query.mobile);
    const status = clean(req.query.status).toUpperCase();
    const type = clean(req.query.type).toUpperCase();
    const startDate = clean(req.query.startDate);
    const endDate = clean(req.query.endDate);

    let query = `SELECT * FROM transactions WHERE 1=1`;
    const params = [];

    if (transactionId) {
      query += ` AND transaction_id LIKE ?`;
      params.push(`%${transactionId}%`);
    }
    if (rrn) {
      query += ` AND rrn LIKE ?`;
      params.push(`%${rrn}%`);
    }
    if (account) {
      query += ` AND (sender_account LIKE ? OR beneficiary_account LIKE ?)`;
      params.push(`%${account}%`, `%${account}%`);
    }
    if (mobile) {
      query += ` AND sender_mobile LIKE ?`;
      params.push(`%${mobile}%`);
    }
    if (status && status !== 'ALL') {
      query += ` AND UPPER(transaction_status) = ?`;
      params.push(status);
    }
    if (type && type !== 'ALL') {
      query += ` AND UPPER(transaction_type) = ?`;
      params.push(type);
    }
    if (startDate) {
      query += ` AND transaction_date >= ?`;
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      query += ` AND transaction_date <= ?`;
      params.push(`${endDate} 23:59:59`);
    }

    query += ` ORDER BY transaction_date DESC, id DESC LIMIT 500`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Search transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to search transactions.' });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pa.id, pa.transaction_id, pa.requested_by, pa.requested_at, pa.approved_by, pa.approved_at,
             pa.status, pa.remarks, t.rrn, t.transaction_type, t.direction, t.sender_account, t.sender_name,
             t.sender_mobile, t.beneficiary_account, t.beneficiary_name, t.beneficiary_ifsc, t.amount,
             t.transaction_status, t.branch_code, t.initiated_by, t.transaction_date
      FROM pending_approvals pa
      INNER JOIN transactions t ON pa.transaction_id = t.transaction_id
      WHERE UPPER(pa.status) = 'PENDING'
      ORDER BY pa.requested_at DESC, pa.id DESC`);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending approvals.' });
  }
};

const sendForApproval = async (req, res) => {
  try {
    const transactionId = clean(req.body.transactionId);
    const requestedBy = clean(req.body.requestedBy);
    const remarks = clean(req.body.remarks);
    if (!patterns.transactionId.test(transactionId) || !patterns.employeeId.test(requestedBy)) return res.status(400).json({ success: false, message: 'Valid transaction ID and requester ID are required.' });
    if (remarks.length > 255) return res.status(400).json({ success: false, message: 'Remarks cannot exceed 255 characters.' });

    const [transactions] = await pool.query(`SELECT transaction_id, transaction_status FROM transactions WHERE transaction_id = ? LIMIT 1`, [transactionId]);
    if (!transactions.length) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (transactions[0].transaction_status !== 'PENDING') return res.status(400).json({ success: false, message: `Transaction is ${transactions[0].transaction_status}.` });

    const [existing] = await pool.query(`SELECT id FROM pending_approvals WHERE transaction_id = ? AND status = 'PENDING' LIMIT 1`, [transactionId]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Transaction is already awaiting approval.' });

    await pool.query(`INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks) VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`, [transactionId, requestedBy, remarks || null]);
    res.status(201).json({ success: true, message: 'Transaction sent for approval successfully.', data: { transactionId, status: 'PENDING' } });
  } catch (error) {
    console.error('Send for approval error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

async function updateApproval(req, res, approved) {
  const connection = await pool.getConnection();
  try {
    const transactionId = clean(req.body.transactionId);
    const approvedBy = clean(req.body.approvedBy) || 'EMP1003';
    const remarks = clean(req.body.remarks);
    if (!patterns.transactionId.test(transactionId)) {
      return res.status(400).json({ success: false, message: 'Valid transaction ID is required.' });
    }

    await connection.beginTransaction();
    const [approvals] = await connection.query(
      `SELECT id FROM pending_approvals WHERE transaction_id = ? AND status = 'PENDING' LIMIT 1 FOR UPDATE`,
      [transactionId]
    );
    if (!approvals.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Pending approval not found.' });
    }

    const [txRows] = await connection.query(
      `SELECT * FROM transactions WHERE transaction_id = ? FOR UPDATE`,
      [transactionId]
    );
    if (!txRows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Transaction record not found.' });
    }

    const tx = txRows[0];
    const amount = Number(tx.amount || 0);

    if (approved) {
      // 1. Lock and verify sender account balance
      const [senderRows] = await connection.query(
        `SELECT balance, status FROM accounts WHERE account_number = ? FOR UPDATE`,
        [tx.sender_account]
      );
      if (!senderRows.length) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Sender account ${tx.sender_account} not found in database.` });
      }

      const sBalance = Number(senderRows[0].balance || 0);
      if (sBalance < amount) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Approval failed: Insufficient balance in sender account. Available: ₹${sBalance.toFixed(2)}, Required: ₹${amount.toFixed(2)}`
        });
      }

      // 2. Deduct funds from sender account
      await connection.query(
        `UPDATE accounts SET balance = balance - ?, updated_at = NOW() WHERE account_number = ?`,
        [amount, tx.sender_account]
      );

      // 3. If beneficiary account exists in our bank, credit funds
      const [receiverRows] = await connection.query(
        `SELECT balance FROM accounts WHERE account_number = ? FOR UPDATE`,
        [tx.beneficiary_account]
      );
      if (receiverRows.length > 0) {
        await connection.query(
          `UPDATE accounts SET balance = balance + ?, updated_at = NOW() WHERE account_number = ?`,
          [amount, tx.beneficiary_account]
        );
      }
    }

    const newTransactionStatus = approved ? 'SUCCESS' : 'FAILED';
    const responseCode = approved ? '00' : 'RJ';
    const responseMessage = approved ? 'Transaction approved and funds transferred' : (remarks || 'Transaction rejected by checker');

    await connection.query(
      `UPDATE transactions SET transaction_status = ?, approved_by = ?, response_code = ?, response_message = ? WHERE transaction_id = ?`,
      [newTransactionStatus, approvedBy, responseCode, responseMessage, transactionId]
    );

    await connection.query(
      `UPDATE pending_approvals SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, remarks = ? WHERE transaction_id = ? AND status = 'PENDING'`,
      [approved ? 'APPROVED' : 'REJECTED', approvedBy, remarks || (approved ? 'Approved by checker' : 'Rejected'), transactionId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: approved ? `Transaction ${transactionId} approved. ₹${amount.toFixed(2)} transferred successfully.` : `Transaction ${transactionId} rejected.`,
      data: { transactionId, status: approved ? 'APPROVED' : 'REJECTED' }
    });
  } catch (error) {
    await connection.rollback();
    console.error(`${approved ? 'Approve' : 'Reject'} transaction error:`, error);
    res.status(500).json({ success: false, message: error.message || 'Unable to update transaction approval.' });
  } finally {
    connection.release();
  }
}

const approveTransaction = (req, res) => updateApproval(req, res, true);
const rejectTransaction = (req, res) => updateApproval(req, res, false);

const bulkUpload = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const fileName = clean(req.body.fileName);
    const content = String(req.body.content ?? '');
    const uploadedBy = clean(req.body.uploadedBy);
    if (!fileName.toLowerCase().endsWith('.csv')) return res.status(400).json({ success: false, message: 'Only CSV files are supported.' });
    if (!content.trim()) return res.status(400).json({ success: false, message: 'CSV file is empty.' });
    if (content.length > 5_000_000) return res.status(400).json({ success: false, message: 'CSV file is too large. Maximum size is 5 MB.' });

    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return res.status(400).json({ success: false, message: 'CSV must contain a header and at least one record.' });

    const headers = lines[0].split(',').map(v => v.trim().toLowerCase());
    const requiredHeaders = ['debit account', 'beneficiary name', 'beneficiary account', 'ifsc', 'amount', 'purpose', 'remarks'];
    const missing = requiredHeaders.filter(h => !headers.includes(h));
    if (missing.length) return res.status(400).json({ success: false, message: `Missing CSV columns: ${missing.join(', ')}` });

    const idx = Object.fromEntries(requiredHeaders.map(h => [h, headers.indexOf(h)]));
    const records = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
    let validRecords = 0;
    let invalidRecords = 0;
    const errors = [];

    await connection.beginTransaction();
    const [uploadResult] = await connection.query(`INSERT INTO bulk_uploads (file_name, total_records, upload_status) VALUES (?, ?, 'PROCESSING')`, [fileName, records.length]);
    const bulkId = uploadResult.insertId;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const senderAccount = clean(row[idx['debit account']]);
      const beneficiaryName = clean(row[idx['beneficiary name']]);
      const beneficiaryAccount = clean(row[idx['beneficiary account']]);
      const ifsc = clean(row[idx.ifsc]).toUpperCase();
      const amount = Number(row[idx.amount]);
      const purpose = clean(row[idx.purpose]);
      const remarks = clean(row[idx.remarks]);
      const problems = [];
      if (!patterns.account.test(senderAccount)) problems.push('invalid debit account');
      if (!patterns.name.test(beneficiaryName)) problems.push('invalid beneficiary name');
      if (!patterns.account.test(beneficiaryAccount)) problems.push('invalid beneficiary account');
      if (!patterns.ifsc.test(ifsc)) problems.push('invalid IFSC');
      if (!validAmount(amount)) problems.push('invalid amount');
      if (!['Personal', 'Education', 'Medical', 'Business', 'Other'].includes(purpose)) problems.push('invalid purpose');
      if (remarks.length > 200) problems.push('remarks too long');

      const reference = `BULK-${Date.now()}-${i + 1}`;
      if (problems.length) {
        invalidRecords++;
        errors.push({ row: i + 2, message: problems.join(', ') });
        await connection.query(`INSERT INTO bulk_upload_records (bulk_upload_id, transaction_reference, transaction_type, amount, record_status, error_message) VALUES (?, ?, 'IMPS', ?, 'FAILED', ?)`, [bulkId, reference, Number.isFinite(amount) ? amount : 0, problems.join(', ')]);
        continue;
      }

      validRecords++;
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 100000)}${i + 1}`;
      const rrn = `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-12);
      await connection.query(
        `INSERT INTO transactions
         (transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
          beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code, initiated_by, response_message, transaction_date)
         VALUES (?, ?, 'IMPS', 'OUTBOUND', ?, 'Bulk Upload Customer', '9876543210', ?, ?, ?, ?, 'PENDING', 'BR001', ?, ?, NOW())`,
        [transactionId, rrn, senderAccount, beneficiaryAccount, beneficiaryName, ifsc, amount, uploadedBy || 'SYSTEM', remarks || 'Bulk transaction awaiting approval']
      );
      await connection.query(
        `INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks) VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`,
        [transactionId, uploadedBy || 'SYSTEM', remarks || 'Bulk transaction approval required']
      );
      await connection.query(`INSERT INTO bulk_upload_records (bulk_upload_id, transaction_reference, transaction_type, amount, record_status) VALUES (?, ?, 'IMPS', ?, 'VALID')`, [bulkId, transactionId, amount]);
    }

    await connection.query(`UPDATE bulk_uploads SET successful_records = ?, failed_records = ?, upload_status = ? WHERE id = ?`, [validRecords, invalidRecords, invalidRecords ? (validRecords ? 'PARTIAL' : 'FAILED') : 'VALIDATED', bulkId]);
    await connection.commit();
    res.status(201).json({ success: true, message: 'File validation completed.', data: { bulkUploadId: bulkId, totalRecords: records.length, validRecords, invalidRecords, errors } });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Unable to process bulk upload.' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  searchTransactions,
  getPendingApprovals,
  sendForApproval,
  approveTransaction,
  rejectTransaction,
  bulkUpload
};
