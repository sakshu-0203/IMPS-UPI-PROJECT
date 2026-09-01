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
  status = 'All';

  selectedTransaction: ReversalTransaction | null = null;

  transactions: ReversalTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void { this.loadTransactions(); }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows.map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, originalDate: r.transaction_date,
          customerName: r.sender_name || '—', accountNumber: r.sender_account, amount: Number(r.amount),
          reason: r.response_message || 'Reversal requested by operations',
          status: String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Rejected' : String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Completed' : 'Pending'
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


        const matchesStatus =
          this.status === 'All' ||
          transaction.status === this.status;


        return matchesSearch && matchesStatus;

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
    this.status = 'All';

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