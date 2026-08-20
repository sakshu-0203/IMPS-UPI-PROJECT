import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { AuthService } from '../../../services/auth.service';
import { VALIDATION, required, validAmount } from '../../../utils/validation';

@Component({
  selector: 'app-new-transfer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-transfer.html',
  styleUrl: './new-transfer.css'
})
export class NewTransfer {
  debitAccount = '';
  beneficiaryName = '';
  beneficiaryAccount = '';
  ifscCode = '';
  amount: number | null = null;
  remarks = '';
  purpose = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  fieldErrors: Record<string, string> = {};

  constructor(private transactionService: TransactionService, private auth: AuthService) {}

  submitTransfer(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    if (!required(this.debitAccount) || !VALIDATION.accountNumber.test(this.debitAccount.trim().toUpperCase())) this.fieldErrors.debitAccount = 'Select a valid debit account.';
    if (!required(this.beneficiaryName) || !VALIDATION.name.test(this.beneficiaryName.trim())) this.fieldErrors.beneficiaryName = 'Enter a valid beneficiary name.';
    if (!required(this.beneficiaryAccount) || !VALIDATION.accountNumber.test(this.beneficiaryAccount.trim().toUpperCase())) this.fieldErrors.beneficiaryAccount = 'Account number must contain 9–18 digits.';
    if (!required(this.ifscCode) || !VALIDATION.ifsc.test(this.ifscCode.trim().toUpperCase())) this.fieldErrors.ifscCode = 'Enter a valid 11-character IFSC (e.g. SBIN0001234).';
    if (!validAmount(this.amount)) this.fieldErrors.amount = 'Amount must be greater than ₹0 and not exceed ₹5,00,000.';
    if (!['Personal', 'Education', 'Medical', 'Business', 'Other'].includes(this.purpose)) this.fieldErrors.purpose = 'Select a transfer purpose.';
    if (this.remarks.length > 200) this.fieldErrors.remarks = 'Remarks cannot exceed 200 characters.';

    if (Object.keys(this.fieldErrors).length) {
      this.errorMessage = 'Please correct the highlighted fields before continuing.';
      return;
    }
    if (this.loading) return;
    this.loading = true;

    const user = this.auth.getUser();
    const transactionData = {
      transactionType: 'IMPS', direction: 'OUTBOUND',
      senderAccount: this.debitAccount.trim().toUpperCase(),
      senderName: user?.employeeName || 'Test Customer', senderMobile: '9876543210',
      beneficiaryAccount: this.beneficiaryAccount.trim().toUpperCase(),
      beneficiaryName: this.beneficiaryName.trim(), beneficiaryIfsc: this.ifscCode.trim().toUpperCase(),
      amount: Number(this.amount), purpose: this.purpose, remarks: this.remarks.trim(),
      branchCode: user?.branchCode || 'BR001', initiatedBy: user?.employeeId || 'SYSTEM'
    };

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response?.success) {
          this.successMessage = response.message || 'Transaction created successfully.';
        } else {
          this.errorMessage = response?.message || 'Transaction could not be created.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to connect to backend.';
      }
    });
  }

  resetForm(): void {
    this.debitAccount = ''; this.beneficiaryName = ''; this.beneficiaryAccount = ''; this.ifscCode = '';
    this.amount = null; this.remarks = ''; this.purpose = ''; this.errorMessage = ''; this.successMessage = ''; this.loading = false; this.fieldErrors = {};
  }
}
