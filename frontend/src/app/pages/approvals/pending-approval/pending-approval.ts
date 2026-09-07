import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { AuthService } from '../../../services/auth.service';

export interface ApprovedReceipt {
  transactionId: string;
  rrn: string;
  amount: number;
  transactionType: string;
  senderAccount: string;
  senderName: string;
  beneficiaryAccount: string;
  beneficiaryName: string;
  beneficiaryIfsc: string;
  approvedBy: string;
  status: string;
  date: Date;
}

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-approval.html',
  styleUrl: './pending-approval.css'
})
export class PendingApprovals implements OnInit {
  approvals: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  actionId = '';

  // Success Modal State
  showSuccessModal = false;
  approvedReceipt: ApprovedReceipt | null = null;
  copiedTxnId = false;

  constructor(
    private transactionService: TransactionService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadPendingApprovals(); }

  loadPendingApprovals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.transactionService.getPendingApprovals().subscribe({
      next: (response) => {
        this.approvals = response?.success && Array.isArray(response.data) ? response.data : [];
        if (!response?.success) this.errorMessage = response?.message || 'Unable to load pending approvals.';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to connect to backend API.';
        this.cdr.detectChanges();
      }
    });
  }

  approveTransaction(approval: any): void {
    const transactionId = String(approval?.transaction_id || '');
    const user = this.auth.getUser();
    const approverId = user?.employeeId || 'EMP1003';
    if (!transactionId) { this.errorMessage = 'Transaction ID is missing.'; return; }

    this.actionId = transactionId;
    this.errorMessage = '';
    this.successMessage = '';

    this.transactionService.approveTransaction(transactionId, approverId, '').subscribe({
      next: (response) => {
        this.actionId = '';
        if (response?.success) {
          this.approvedReceipt = {
            transactionId: transactionId,
            rrn: approval?.rrn || `${Date.now()}`.slice(-12),
            amount: Number(approval?.amount || 0),
            transactionType: approval?.transaction_type || 'IMPS',
            senderAccount: approval?.sender_account || '123456789012',
            senderName: approval?.sender_name || 'Test Customer',
            beneficiaryAccount: approval?.beneficiary_account || '',
            beneficiaryName: approval?.beneficiary_name || '',
            beneficiaryIfsc: approval?.beneficiary_ifsc || 'SBIN0001234',
            approvedBy: approverId,
            status: 'SUCCESS',
            date: new Date()
          };
          this.showSuccessModal = true;
          this.successMessage = response.message || `Transaction ${transactionId} approved and processed successfully.`;
          this.loadPendingApprovals();
        } else {
          this.errorMessage = response?.message || 'Approval failed.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.actionId = '';
        this.errorMessage = error?.error?.message || 'Approval request failed.';
        this.cdr.detectChanges();
      }
    });
  }

  rejectTransaction(approval: any): void {
    const transactionId = String(approval?.transaction_id || '');
    const user = this.auth.getUser();
    const approverId = user?.employeeId || 'EMP1003';
    if (!transactionId) { this.errorMessage = 'Transaction ID is missing.'; return; }
    const remarks = window.prompt('Enter the rejection reason:')?.trim() || '';
    if (remarks.length < 3) { this.errorMessage = 'Rejection reason must contain at least 3 characters.'; return; }
    if (remarks.length > 255) { this.errorMessage = 'Rejection reason cannot exceed 255 characters.'; return; }
    if (!window.confirm(`Reject transaction ${transactionId}?`)) return;
    this.actionId = transactionId;
    this.errorMessage = '';
    this.successMessage = '';
    this.transactionService.rejectTransaction(transactionId, approverId, remarks).subscribe({
      next: (response) => {
        this.actionId = '';
        if (response?.success) {
          this.successMessage = response.message || `Transaction ${transactionId} rejected.`;
          this.loadPendingApprovals();
        } else {
          this.errorMessage = response?.message || 'Rejection failed.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.actionId = '';
        this.errorMessage = error?.error?.message || 'Rejection request failed.';
        this.cdr.detectChanges();
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  goToSearch(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/transactions/search']);
  }

  goToOutbound(): void {
    this.showSuccessModal = false;
    const targetId = this.approvedReceipt?.transactionId;
    if (targetId) {
      this.router.navigate(['/transactions/outbound'], { queryParams: { id: targetId } });
    } else {
      this.router.navigate(['/transactions/outbound']);
    }
  }

  goToDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/dashboard']);
  }

  copyTxnId(): void {
    if (!this.approvedReceipt?.transactionId) return;
    navigator.clipboard.writeText(this.approvedReceipt.transactionId).then(() => {
      this.copiedTxnId = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedTxnId = false;
        this.cdr.detectChanges();
      }, 2500);
    }).catch(() => {});
  }

  formatAmount(amount: number): string {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
