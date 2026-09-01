import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface ReversalTransaction {
  transactionId: string;
  rrn: string;
  originalDate: string;
  customerName: string;
  accountNumber: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
}

@Component({
  selector: 'app-reversal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reversal.html',
  styleUrl: './reversal.css'
})
export class Reversal {

  searchValue = '';

 selectedTransaction: ReversalTransaction | null = null;

 transactions: ReversalTransaction[] = [];
 loading = false;
 errorMessage = '';

 constructor(private transactionService: TransactionService) {}

 private normalizeTransactionStatus(status: unknown): ReversalTransaction['status'] {
    const value = String(status ?? '').trim().toUpperCase();

    if (['FAILED', 'REJECTED', 'RJ'].includes(value)) {
      return 'Rejected';
    }

    if (['APPROVED', 'APPROVAL_GRANTED'].includes(value)) {
      return 'Approved';
    }

    if (['SUCCESS', 'COMPLETED', 'SETTLED'].includes(value)) {
      return 'Completed';
    }

    if (['PENDING', 'IN PROCESS', 'IP'].includes(value)) {
      return 'Pending';
    }

    return 'Pending';
  }

  ngOnInit(): void { this.loadTransactions(); }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = (Array.isArray(response?.data) ? response.data : [])
          .filter((r: any) => {
            const status = String(r?.transaction_status ?? '').trim().toUpperCase();
            return ['FAILED', 'REJECTED', 'RJ'].includes(status);
          })
          .sort((a: any, b: any) => {
            const aDate = new Date(a?.transaction_date || 0).getTime();
            const bDate = new Date(b?.transaction_date || 0).getTime();
            return bDate - aDate;
          });

        this.transactions = rows.map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, originalDate: r.transaction_date,
          customerName: r.sender_name || '—', accountNumber: r.sender_account, amount: Number(r.amount),
          reason: r.response_message || 'Reversal requested by operations',
          status: this.normalizeTransactionStatus(r.transaction_status)
        }));
      },
      error: (error: any) => { this.loading = false; this.errorMessage = error?.error?.message || 'Unable to load reversal records.'; }
    });
  }


  get filteredTransactions(): ReversalTransaction[] {

    const search = this.searchValue
      .trim()
      .toLowerCase();

    return this.transactions.filter(
      transaction => {

        const matchesSearch =
          !search ||

          transaction.transactionId
            .toLowerCase()
            .includes(search) ||

          transaction.rrn
            .toLowerCase()
            .includes(search) ||

          transaction.customerName
            .toLowerCase()
            .includes(search) ||

          transaction.accountNumber
            .toLowerCase()
            .includes(search);


        return matchesSearch;

      }
    );

  }


  get totalCount(): number {

    return this.transactions.length;

  }


  get pendingCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Pending'
    ).length;

  }


  get approvedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Approved'
    ).length;

  }


  get completedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Completed'
    ).length;

  }


  get rejectedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Rejected'
    ).length;

  }


  viewTransaction(
    transaction: ReversalTransaction
  ): void {

    this.selectedTransaction = transaction;

  }


  closeDetails(): void {

    this.selectedTransaction = null;

  }


  clearFilters(): void {

    this.searchValue = '';

  }


  requestReversal(
    transaction: ReversalTransaction
  ): void {

    transaction.status = 'Pending';

    alert(
      `Reversal request created for ${transaction.transactionId}`
    );

  }


  approveReversal(
    transaction: ReversalTransaction
  ): void {

    transaction.status = 'Approved';

    alert(
      `Reversal approved for ${transaction.transactionId}`
    );

  }


  rejectReversal(
    transaction: ReversalTransaction
  ): void {

    transaction.status = 'Rejected';

    alert(
      `Reversal rejected for ${transaction.transactionId}`
    );

  }

}