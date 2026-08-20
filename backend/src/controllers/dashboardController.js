const { pool } = require('../config/database');

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const [summaryRows] = await pool.query(`
      SELECT
        COUNT(*) AS totalTransactions,
        COALESCE(SUM(CASE WHEN UPPER(transaction_status) = 'SUCCESS' THEN 1 ELSE 0 END), 0) AS successfulTransactions,
        COALESCE(SUM(CASE WHEN UPPER(transaction_status) = 'PENDING' THEN 1 ELSE 0 END), 0) AS pendingTransactions,
        COALESCE(SUM(CASE WHEN UPPER(transaction_status) = 'FAILED' THEN 1 ELSE 0 END), 0) AS failedTransactions,
        COALESCE(SUM(amount), 0) AS totalAmount
      FROM transactions
    `);

    const [recentTransactions] = await pool.query(`
      SELECT
        id,
        transaction_id,
        rrn,
        transaction_type,
        direction,
        sender_account,
        sender_name,
        beneficiary_account,
        beneficiary_name,
        amount,
        transaction_status,
        branch_code,
        initiated_by,
        approved_by,
        response_code,
        response_message,
        transaction_date
      FROM transactions
      ORDER BY transaction_date DESC, id DESC
      LIMIT 10
    `);

    const summary = summaryRows[0] || {};

    return res.status(200).json({
      success: true,
      message: 'Dashboard loaded successfully.',
      data: {
        summary: {
          totalTransactions: Number(summary.totalTransactions || 0),
          successfulTransactions: Number(summary.successfulTransactions || 0),
          pendingTransactions: Number(summary.pendingTransactions || 0),
          failedTransactions: Number(summary.failedTransactions || 0),
          totalAmount: Number(summary.totalAmount || 0)
        },
        recentTransactions: recentTransactions || []
      }
    });
  } catch (error) {
    console.error('[Dashboard] Database error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load dashboard summary.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getDashboardSummary };
