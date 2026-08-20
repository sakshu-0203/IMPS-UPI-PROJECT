import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../services/transaction.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approval.html',
  styleUrl: './pending-approval.css'
})
export class PendingApprovals implements OnInit {
  approvals: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  actionId = '';

  constructor(private transactionService: TransactionService, private auth: AuthService) {}

  ngOnInit(): void { this.loadPendingApprovals(); }

  loadPendingApprovals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.transactionService.getPendingApprovals().subscribe({
      next: (response) => {
        this.approvals = response?.success && Array.isArray(response.data) ? response.data : [];
        if (!response?.success) this.errorMessage = response?.message || 'Unable to load pending approvals.';
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to connect to backend API.';
      }
    });
  }

  approveTransaction(approval: any): void {
    const transactionId = String(approval?.transaction_id || '');
    const user = this.auth.getUser();
    if (!transactionId || !user?.employeeId) { this.errorMessage = 'Transaction or approver information is missing.'; return; }
    if (!window.confirm(`Are you sure you want to approve transaction ${transactionId}?`)) return;
    this.actionId = transactionId;
    this.errorMessage = '';
    this.successMessage = '';
    this.transactionService.approveTransaction(transactionId, user.employeeId, '').subscribe({
      next: (response) => {
        this.actionId = '';
        if (response?.success) { this.successMessage = response.message || 'Transaction approved successfully.'; this.loadPendingApprovals(); }
        else this.errorMessage = response?.message || 'Approval failed.';
      },
      error: (error) => { this.actionId = ''; this.errorMessage = error?.error?.message || 'Approval request failed.'; }
    });
  }

  rejectTransaction(approval: any): void {
    const transactionId = String(approval?.transaction_id || '');
    const user = this.auth.getUser();
    if (!transactionId || !user?.employeeId) { this.errorMessage = 'Transaction or approver information is missing.'; return; }
    const remarks = window.prompt('Enter the rejection reason:')?.trim() || '';
    if (remarks.length < 3) { this.errorMessage = 'Rejection reason must contain at least 3 characters.'; return; }
    if (remarks.length > 255) { this.errorMessage = 'Rejection reason cannot exceed 255 characters.'; return; }
    if (!window.confirm(`Reject transaction ${transactionId}?`)) return;
    this.actionId = transactionId;
    this.errorMessage = '';
    this.successMessage = '';
    this.transactionService.rejectTransaction(transactionId, user.employeeId, remarks).subscribe({
      next: (response) => {
        this.actionId = '';
        if (response?.success) { this.successMessage = response.message || 'Transaction rejected successfully.'; this.loadPendingApprovals(); }
        else this.errorMessage = response?.message || 'Rejection failed.';
      },
      error: (error) => { this.actionId = ''; this.errorMessage = error?.error?.message || 'Rejection request failed.'; }
    });
  }

  formatAmount(amount: number): string { return Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
}
