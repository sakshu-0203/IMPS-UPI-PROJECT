const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { patterns, clean, required } = require('../utils/validation');

const ALLOWED_ROLES = new Set(['Maker', 'Checker', 'Admin', 'Viewer']);

const login = async (req, res) => {
  try {
    const organisationId = clean(req.body.organisationId);
    const employeeId = clean(req.body.employeeId);
    const password = String(req.body.password ?? '');
    const branchCode = clean(req.body.branchCode).toUpperCase();
    const role = clean(req.body.role);

    if (!required(organisationId) || !patterns.organisationId.test(organisationId)) {
      return res.status(400).json({ success: false, message: 'Enter a valid organisation ID.' });
    }
    if (!required(employeeId) || !patterns.employeeId.test(employeeId)) {
      return res.status(400).json({ success: false, message: 'Enter a valid employee ID.' });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ success: false, message: 'Password must be between 6 and 100 characters.' });
    }
    if (!patterns.branchCode.test(branchCode)) {
      return res.status(400).json({ success: false, message: 'Enter a valid branch code.' });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role.' });
    }

    const [rows] = await pool.query(
      `SELECT id, organisation_id, employee_id, employee_name, email, password, branch_code, role, status
       FROM users
       WHERE organisation_id = ? AND employee_id = ? AND branch_code = ? AND role = ?
       LIMIT 1`,
      [organisationId, employeeId, branchCode, role]
    );

    if (!rows.length) {
      await pool.query(`INSERT INTO login_logs (employee_id, status, failure_reason) VALUES (?, 'FAILED', ?)`, [employeeId, 'Invalid login details']).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid login details.' });
    }

    const user = rows[0];
    if (String(user.status).toUpperCase() !== 'ACTIVE') {
      await pool.query(`INSERT INTO login_logs (employee_id, status, failure_reason) VALUES (?, 'FAILED', ?)`, [employeeId, 'Inactive account']).catch(() => {});
      return res.status(403).json({ success: false, message: 'User account is not active.' });
    }

    let passwordValid = false;
    if (String(user.password).startsWith('$2a$') || String(user.password).startsWith('$2b$') || String(user.password).startsWith('$2y$')) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      passwordValid = password === user.password;
    }

    if (!passwordValid) {
      await pool.query(`INSERT INTO login_logs (employee_id, status, failure_reason) VALUES (?, 'FAILED', ?)`, [employeeId, 'Invalid password']).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid login details.' });
    }

    await pool.query(`INSERT INTO login_logs (employee_id, status) VALUES (?, 'SUCCESS')`, [employeeId]).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        employeeId: user.employee_id,
        employeeName: user.employee_name,
        organisationId: user.organisation_id,
        branchCode: user.branch_code,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { login };
