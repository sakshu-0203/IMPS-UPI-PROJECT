const express = require('express');

const router = express.Router();

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  getPendingApprovals,
  sendForApproval,
  approveTransaction,
  rejectTransaction,
  searchTransactions,
  bulkUpload
} = require('../controllers/transactionController');


// ========================================
// SEARCH
// ========================================

router.get(
  '/search',
  searchTransactions,
  bulkUpload
);


// ========================================
// PENDING APPROVALS
// ========================================


router.get(
  '/pending-approvals',
  getPendingApprovals
);
// ========================================
// SEND FOR APPROVAL
// ========================================

router.post(
  '/send-for-approval',
  sendForApproval
);


// ========================================
// APPROVE
// ========================================

router.post(
  '/approve',
  approveTransaction
);


// ========================================
// REJECT
// ========================================

router.post(
  '/reject',
  rejectTransaction
);

router.post(
  '/bulk-upload',
  bulkUpload
);


// ========================================
// GET ALL TRANSACTIONS
// ========================================

router.get(
  '/',
  getTransactions
);


// ========================================
// CREATE TRANSACTION
// ========================================

router.post(
  '/',
  createTransaction
);


// ========================================
// GET TRANSACTION BY ID
// ========================================

router.get(
  '/:transactionId',
  getTransactionById
);



module.exports = router;