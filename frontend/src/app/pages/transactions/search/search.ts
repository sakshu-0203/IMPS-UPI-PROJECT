import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { TransactionService } from '../../../services/transaction.service';
import { VALIDATION, normalizeTransactionDirection } from '../../../utils/validation';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit {

  searchTerm = '';
  transactionId = '';
  rrn = '';
  account = '';
  mobile = '';
  status = '';
  type = '';

  allTransactions: any[] = [];
  transactions: any[] = [];

  loading = false;
  errorMessage = '';

  // Stats Counters
  totalCount = 0;
  successCount = 0;
  failedCount = 0;
  pendingCount = 0;

  // Selected Transaction for Details Modal
  selectedTransaction: any = null;
  copiedId = false;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.search();
  }

  setStatusFilter(statusVal: string): void {
    this.status = statusVal;
    this.search();
  }

  onFilterChange(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters = {
      transactionId: this.transactionId.trim(),
      rrn: this.rrn.trim(),
      account: this.account.trim(),
      mobile: this.mobile.trim(),
      status: this.status,
      type: this.type
    };

    this.transactionService
      .searchTransactions(filters)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response?.success && Array.isArray(response.data)) {
            let data = response.data;

            // Optional client-side keyword search across ID, sender, beneficiary
            if (this.searchTerm.trim()) {
              const q = this.searchTerm.trim().toLowerCase();
              data = data.filter((t: any) =>
                (t.transaction_id && t.transaction_id.toLowerCase().includes(q)) ||
                (t.rrn && t.rrn.toLowerCase().includes(q)) ||
                (t.sender_account && t.sender_account.toLowerCase().includes(q)) ||
                (t.sender_name && t.sender_name.toLowerCase().includes(q)) ||
                (t.beneficiary_account && t.beneficiary_account.toLowerCase().includes(q)) ||
                (t.beneficiary_name && t.beneficiary_name.toLowerCase().includes(q))
              );
            }

            this.transactions = data;
            this.updateCounts(response.data);
          } else {
            this.transactions = [];
            this.errorMessage = response?.message || 'No transactions found.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.transactions = [];
          this.errorMessage = error?.error?.message || 'Unable to connect to backend server.';
          this.cdr.detectChanges();
        }
      });
  }

  private updateCounts(items: any[]): void {
    this.totalCount = items.length;
    this.successCount = items.filter(t => String(t.transaction_status).toUpperCase() === 'SUCCESS').length;
    this.failedCount = items.filter(t => String(t.transaction_status).toUpperCase() === 'FAILED').length;
    this.pendingCount = items.filter(t => ['PENDING', 'IN PROCESS'].includes(String(t.transaction_status).toUpperCase())).length;
  }

  clear(): void {
    this.searchTerm = '';
    this.transactionId = '';
    this.rrn = '';
    this.account = '';
    this.mobile = '';
    this.status = '';
    this.type = '';
    this.errorMessage = '';
    this.search();
  }

  viewDetails(tx: any): void {
    const direction = normalizeTransactionDirection(tx);
    const txnId = tx.transaction_id || tx.transactionId || tx.id || tx.rrn;
    const targetRoute = direction === 'INBOUND' ? '/transactions/inbound' : '/transactions/outbound';
    this.router.navigate([targetRoute], { queryParams: { id: txnId } });
  }

  closeDetailsModal(): void {
    this.selectedTransaction = null;
    this.cdr.detectChanges();
  }

  copyModalTxnId(): void {
    if (!this.selectedTransaction?.transaction_id) return;
    navigator.clipboard.writeText(this.selectedTransaction.transaction_id).then(() => {
      this.copiedId = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedId = false;
        this.cdr.detectChanges();
      }, 2000);
    }).catch(() => {});
  }

  formatAmount(amount: number): string {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}