const { pool } = require('../config/database');
const { patterns, clean, validAmount } = require('../utils/validation');

const listAccounts = async (req, res) => {
  try {
    const accountNumber = clean(req.query.accountNumber);
    let sql = `SELECT * FROM accounts WHERE 1=1`;
    const params = [];
    if (accountNumber) { sql += ` AND account_number = ?`; params.push(accountNumber); }
    sql += ` ORDER BY customer_name ASC LIMIT 200`;
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Unable to load accounts.' }); }
};


const accountStatement = async (req, res) => {
  try {
    const account = clean(req.params.accountNumber);
    const from = clean(req.query.from);
    const to = clean(req.query.to);

    if (!patterns.account.test(account)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid account number.'
      });
    }

    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid from date.'
      });
    }

    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid to date.'
      });
    }

    if (from && to && new Date(from) > new Date(to)) {
      return res.status(400).json({
        success: false,
        message: 'From date cannot be after to date.'
      });
    }

  
    let sql = `
      SELECT
        t.transaction_id,
        t.rrn,
        t.direction,

        t.sender_account,
        sender.customer_name AS customer_name,

        t.beneficiary_account,
        beneficiary.customer_name AS beneficiary_name,

        t.amount,
        t.transaction_status,
        t.transaction_date

      FROM transactions t

      LEFT JOIN accounts sender
        ON sender.account_number = t.sender_account

      LEFT JOIN beneficiaries beneficiary
        ON beneficiary.account_number = t.beneficiary_account

      WHERE (
        t.sender_account = ?
        OR t.beneficiary_account = ?
      )
    `;

    const params = [account, account];

    if (from) {
      sql += ` AND t.transaction_date >= ?`;
      params.push(`${from} 00:00:00`);
    }

    if (to) {
      sql += ` AND t.transaction_date <= ?`;
      params.push(`${to} 23:59:59`);
    }

    sql += ` ORDER BY t.transaction_date DESC LIMIT 500`;

    const [rows] = await pool.query(sql, params);

    const [accounts] = await pool.query(
      `SELECT * FROM accounts WHERE account_number = ? LIMIT 1`,
      [account]
    );

    res.json({
      success: true,
      data: {
        account: accounts[0] || null,
        transactions: rows
      }
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      success: false,
      message: 'Unable to load account statement.'
    });
  }
};


const listBeneficiaries = async (_req, res) => {
  try { const [rows] = await pool.query(`SELECT * FROM beneficiaries ORDER BY created_at DESC, id DESC`); res.json({ success: true, data: rows }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Unable to load beneficiaries.' }); }
};

const addBeneficiary = async (req, res) => {
  try {
    const customerName = clean(req.body.customerName);
    const accountNumber = clean(req.body.accountNumber).toUpperCase();
    const ifscCode = clean(req.body.ifscCode).toUpperCase();
    const bankName = clean(req.body.bankName);
    const mobileNumber = clean(req.body.mobileNumber);
    if (!patterns.name.test(customerName)) return res.status(400).json({ success: false, message: 'Enter a valid beneficiary name.' });
    if (!patterns.account.test(accountNumber)) return res.status(400).json({ success: false, message: 'Enter a valid account number.' });
    if (!patterns.ifsc.test(ifscCode)) return res.status(400).json({ success: false, message: 'Enter a valid IFSC code.' });
    if (mobileNumber && !patterns.mobile.test(mobileNumber)) return res.status(400).json({ success: false, message: 'Enter a valid mobile number.' });
    if (bankName.length > 150) return res.status(400).json({ success: false, message: 'Bank name is too long.' });
    const [result] = await pool.query(`INSERT INTO beneficiaries (customer_name, account_number, ifsc_code, bank_name, mobile_number, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')`, [customerName, accountNumber, ifscCode, bankName || null, mobileNumber || null]);
    res.status(201).json({ success: true, message: 'Beneficiary added successfully.', data: { id: result.insertId } });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Beneficiary already exists.' });
    console.error(e); res.status(500).json({ success: false, message: 'Unable to add beneficiary.' });
  }
};

const transactionReport = async (req, res) => {
  try {
    const status = clean(req.query.status).toUpperCase();
    const direction = clean(req.query.direction).toUpperCase();
    let sql = `SELECT * FROM transactions WHERE 1=1`; const params=[];
    if (status) { if (!['PENDING','SUCCESS','FAILED'].includes(status)) return res.status(400).json({success:false,message:'Invalid status.'}); sql += ` AND transaction_status=?`; params.push(status); }
    if (direction) { if (!['INBOUND','OUTBOUND','INWARD','OUTWARD'].includes(direction)) return res.status(400).json({success:false,message:'Invalid direction.'}); sql += ` AND direction=?`; params.push(direction); }
    sql += ` ORDER BY transaction_date DESC LIMIT 1000`;
    const [rows]=await pool.query(sql,params); res.json({success:true,data:rows});
  } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load transaction report.'});}
};

const settlementReport = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT DATE(transaction_date) report_date, COUNT(*) total_transactions, SUM(amount) total_amount, SUM(transaction_status='SUCCESS') successful, SUM(transaction_status='FAILED') failed, SUM(transaction_status='PENDING') pending FROM transactions GROUP BY DATE(transaction_date) ORDER BY report_date DESC LIMIT 90`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load settlement report.'});}
};

const reconciliationReport = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT transaction_status, COUNT(*) transaction_count, COALESCE(SUM(amount),0) total_amount FROM transactions GROUP BY transaction_status ORDER BY transaction_status`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load reconciliation report.'});}
};

const apiLogs = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT * FROM api_logs ORDER BY created_at DESC, id DESC LIMIT 200`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load API logs.'});}
};

const alerts = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC, id DESC LIMIT 200`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load alerts.'});}
};

const systemHealth = async (_req,res)=>{
  try { const connection=await pool.getConnection(); await connection.ping(); connection.release(); res.json({success:true,data:{api:'UP',database:'UP',timestamp:new Date().toISOString(),environment:process.env.NODE_ENV||'development'}}); }
  catch(e){console.error(e);res.status(503).json({success:false,message:'Database health check failed.',data:{api:'UP',database:'DOWN'}});}
};

const users = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT id, organisation_id, employee_id, employee_name, email, branch_code, role, status, created_at, updated_at FROM users ORDER BY employee_name`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load users.'});}
};

const createUser = async (req,res)=>{
  try { const {organisationId,employeeId,employeeName,email,password,branchCode,role}=req.body; if(!/^[A-Za-z0-9_-]{3,100}$/.test(clean(organisationId))) return res.status(400).json({success:false,message:'Invalid organisation ID.'}); if(!patterns.employeeId.test(clean(employeeId))) return res.status(400).json({success:false,message:'Invalid employee ID.'}); if(!patterns.name.test(clean(employeeName))) return res.status(400).json({success:false,message:'Invalid employee name.'}); if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(email))) return res.status(400).json({success:false,message:'Invalid email address.'}); if(String(password||'').length<6) return res.status(400).json({success:false,message:'Password must be at least 6 characters.'}); if(!patterns.branchCode.test(clean(branchCode))) return res.status(400).json({success:false,message:'Invalid branch code.'}); if(!['Maker','Checker','Admin','Viewer'].includes(role)) return res.status(400).json({success:false,message:'Invalid role.'}); const [r]=await pool.query(`INSERT INTO users (organisation_id,employee_id,employee_name,email,password,branch_code,role,status) VALUES (?,?,?,?,?,?,?,'ACTIVE')`,[clean(organisationId),clean(employeeId),clean(employeeName),clean(email)||null,password,clean(branchCode).toUpperCase(),role]); res.status(201).json({success:true,message:'User created successfully.',data:{id:r.insertId}}); }
  catch(e){if(e.code==='ER_DUP_ENTRY') return res.status(409).json({success:false,message:'Employee ID already exists.'}); console.error(e);res.status(500).json({success:false,message:'Unable to create user.'});}
};

const roles = async (_req,res)=>{ try { const [rows]=await pool.query(`SELECT role, COUNT(*) user_count FROM users GROUP BY role ORDER BY role`); res.json({success:true,data:rows}); } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load roles.'});} };

const systemSettings = async (_req,res)=>{ try { const [rows]=await pool.query(`SELECT * FROM system_config ORDER BY config_key`); res.json({success:true,data:rows}); } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load system settings.'});} };

const saveSystemSetting = async (req,res)=>{ try { const key=clean(req.body.configKey); const value=String(req.body.configValue??''); const description=clean(req.body.description); if(!/^[A-Za-z0-9._-]{2,100}$/.test(key)) return res.status(400).json({success:false,message:'Invalid configuration key.'}); if(value.length>5000) return res.status(400).json({success:false,message:'Configuration value is too long.'}); await pool.query(`INSERT INTO system_config (config_key,config_value,description) VALUES (?,?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value), description=VALUES(description)`,[key,value,description||null]); res.json({success:true,message:'System setting saved successfully.'}); } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to save system setting.'});} };

module.exports={listAccounts,accountStatement,listBeneficiaries,addBeneficiary,transactionReport,settlementReport,reconciliationReport,apiLogs,alerts,systemHealth,users,createUser,roles,systemSettings,saveSystemSetting};
