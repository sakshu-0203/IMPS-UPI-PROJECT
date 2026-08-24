import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { TransactionService } from '../../../services/transaction.service';
import { OperationsService } from '../../../services/operations.service';
import { AuthService } from '../../../services/auth.service';

import {
  VALIDATION,
  required,
  validAmount
} from '../../../utils/validation';

export interface AccountOption {
  id?: number;
  account_number: string;
  customer_name?: string;
  account_type?: string;
  balance?: number | string;
  branch_code?: string;
}

export interface BeneficiaryOption {
  id?: number;
  customer_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name?: string;
  mobile_number?: string;
}

export interface TransactionReceipt {
  transactionId: string;
  rrn: string;
  status: string;
  amount: number;
  senderAccount: string;
  senderName: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  beneficiaryIfsc: string;
  purpose: string;
  remarks: string;
  date: Date;
}

@Component({
  selector: 'app-new-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './new-transfer.html',
  styleUrl: './new-transfer.css'
})
export class NewTransfer implements OnInit {

  debitAccount = '';
  beneficiaryName = '';
  beneficiaryAccount = '';
  ifscCode = '';
  amount: number | null = null;
  remarks = '';
  purpose = 'Personal';

  errorMessage = '';
  successMessage = '';
  loading = false;
  fieldErrors: Record<string, string> = {};

  // Accounts & Beneficiaries
  accounts: AccountOption[] = [];
  beneficiaries: BeneficiaryOption[] = [];
  selectedBeneficiaryId = '';
  selectedAccount: AccountOption | null = null;

  // Receipt Modal State
  showSuccessModal = false;
  lastTransactionResult: TransactionReceipt | null = null;
  copiedTxnId = false;

  constructor(
    private transactionService: TransactionService,
    private operationsService: OperationsService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadBeneficiaries();
  }

  loadAccounts(): void {
    this.operationsService.getAccounts().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          this.accounts = res.data;
        } else {
          this.fallbackAccounts();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.fallbackAccounts();
        this.cdr.detectChanges();
      }
    });
  }

  private fallbackAccounts(): void {
    this.accounts = [
      {
        account_number: '123456789012',
        customer_name: 'Test Customer',
        account_type: 'SAVINGS',
        balance: 250000,
        branch_code: 'BR001'
      },
      {
        account_number: '123456789013',
        customer_name: 'Rahul Patil',
        account_type: 'CURRENT',
        balance: 185500,
        branch_code: 'BR001'
      },
      {
        account_number: '123456789014',
        customer_name: 'Sneha Kulkarni',
        account_type: 'CURRENT',
        balance: 425750,
        branch_code: 'BR001'
      }
    ];
  }

  loadBeneficiaries(): void {
    this.operationsService.getBeneficiaries().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.beneficiaries = res.data;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.beneficiaries = [];
        this.cdr.detectChanges();
      }
    });
  }

  onAccountChange(): void {
    this.selectedAccount = this.accounts.find(a => a.account_number === this.debitAccount) || null;
    if (this.fieldErrors['debitAccount']) {
      delete this.fieldErrors['debitAccount'];
    }
  }

  onBeneficiarySelect(): void {
    if (!this.selectedBeneficiaryId) return;

    const b = this.beneficiaries.find(item => String(item.id) === this.selectedBeneficiaryId || item.account_number === this.selectedBeneficiaryId);
    if (b) {
      this.beneficiaryName = b.customer_name;
      this.beneficiaryAccount = b.account_number;
      this.ifscCode = b.ifsc_code;

      delete this.fieldErrors['beneficiaryName'];
      delete this.fieldErrors['beneficiaryAccount'];
      delete this.fieldErrors['ifscCode'];
    }
  }

  submitTransfer(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    // Debit Account validation
    if (
      !required(this.debitAccount) ||
      !VALIDATION.accountNumber.test(
        this.debitAccount.trim().toUpperCase()
      )
    ) {
      this.fieldErrors['debitAccount'] = 'Please select a valid debit account.';
    }

    // Beneficiary Name validation
    if (
      !required(this.beneficiaryName) ||
      !VALIDATION.name.test(
        this.beneficiaryName.trim()
      )
    ) {
      this.fieldErrors['beneficiaryName'] = 'Enter a valid beneficiary name (letters and spaces only).';
    }

    // Beneficiary Account validation
    if (
      !required(this.beneficiaryAccount) ||
      !VALIDATION.accountNumber.test(
        this.beneficiaryAccount.trim().toUpperCase()
      )
    ) {
      this.fieldErrors['beneficiaryAccount'] = 'Account number must contain 9–18 digits.';
    }

    // IFSC validation
    if (
      !required(this.ifscCode) ||
      !VALIDATION.ifsc.test(
        this.ifscCode.trim().toUpperCase()
      )
    ) {
      this.fieldErrors['ifscCode'] = 'Enter a valid 11-character IFSC (e.g. SBIN0001234).';
    }

    // Amount validation
    if (!validAmount(this.amount)) {
      this.fieldErrors['amount'] = 'Amount must be greater than ₹0 and not exceed ₹5,00,000.';
    } else if (this.selectedAccount && Number(this.selectedAccount.balance) < Number(this.amount)) {
      this.fieldErrors['amount'] = `Insufficient balance. Available balance is ₹${this.formatNumber(Number(this.selectedAccount.balance))}.`;
    }

    // Purpose validation
    if (
      ![
        'Personal',
        'Education',
        'Medical',
        'Business',
        'Other'
      ].includes(this.purpose)
    ) {
      this.fieldErrors['purpose'] = 'Select a transfer purpose.';
    }

    // Remarks validation
    if (this.remarks && this.remarks.length > 200) {
      this.fieldErrors['remarks'] = 'Remarks cannot exceed 200 characters.';
    }

    // Stop if validation errors exist
    if (Object.keys(this.fieldErrors).length > 0) {
      this.errorMessage = 'Please correct the highlighted fields before continuing.';
      return;
    }

    // Prevent duplicate submission
    if (this.loading) {
      return;
    }

    this.loading = true;

    const user = this.auth.getUser();

    const transactionData = {
      transactionType: 'IMPS',
      direction: 'OUTBOUND',
      senderAccount: this.debitAccount.trim().toUpperCase(),
      senderName: this.selectedAccount?.customer_name || user?.employeeName || 'Test Customer',
      senderMobile: '9876543210',
      beneficiaryAccount: this.beneficiaryAccount.trim().toUpperCase(),
      beneficiaryName: this.beneficiaryName.trim(),
      beneficiaryIfsc: this.ifscCode.trim().toUpperCase(),
      amount: Number(this.amount),
      purpose: this.purpose,
      remarks: this.remarks.trim() || 'IMPS Instant Transfer',
      branchCode: this.selectedAccount?.branch_code || user?.branchCode || 'BR001',
      initiatedBy: user?.employeeId || 'EMP1003'
    };

    this.transactionService
      .createTransaction(transactionData)
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (response?.success) {
            this.lastTransactionResult = {
              transactionId: response.data?.transactionId || `TXN${Date.now()}`,
              rrn: response.data?.rrn || `${Date.now()}`.slice(-12),
              status: 'In Process',
              amount: Number(this.amount),
              senderAccount: this.debitAccount,
              senderName: transactionData.senderName,
              beneficiaryName: this.beneficiaryName,
              beneficiaryAccount: this.beneficiaryAccount,
              beneficiaryIfsc: this.ifscCode,
              purpose: this.purpose,
              remarks: this.remarks,
              date: new Date()
            };

            this.successMessage = response.message || `Transfer request submitted for approval. Status: In Process.`;
            this.showSuccessModal = true;
            this.resetFormFields();
          } else {
            this.errorMessage = response?.message || 'Transaction could not be created.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Unable to connect to backend server. Please verify the service is running.';
          this.cdr.detectChanges();
        }
      });
  }

  resetFormFields(): void {
    this.debitAccount = '';
    this.beneficiaryName = '';
    this.beneficiaryAccount = '';
    this.ifscCode = '';
    this.amount = null;
    this.remarks = '';
    this.purpose = 'Personal';
    this.selectedBeneficiaryId = '';
    this.selectedAccount = null;
    this.fieldErrors = {};
  }

  resetForm(): void {
    this.resetFormFields();
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = false;
    this.cdr.detectChanges();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  initiateAnotherTransfer(): void {
    this.showSuccessModal = false;
    this.resetForm();
  }

  goToPendingApprovals(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/approvals/pending-approval']);
  }

  goToOutbound(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/transactions/outbound']);
  }

  goToDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/dashboard']);
  }

  copyTxnId(): void {
    if (!this.lastTransactionResult?.transactionId) return;
    navigator.clipboard.writeText(this.lastTransactionResult.transactionId).then(() => {
      this.copiedTxnId = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedTxnId = false;
        this.cdr.detectChanges();
      }, 2500);
    }).catch(() => {});
  }

  formatNumber(value: number): string {
    return Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}