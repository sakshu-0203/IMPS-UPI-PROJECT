import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface OutboundTransaction {
  transactionId: string;
  rrn: string;
  date: string;
  customerName: string;
  debitAccount: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  responseCode: string;
}

@Component({
  selector: 'app-outbound',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './outbound.html',
  styleUrl: './outbound.css'
})
export class Outbound {

  searchValue = '';
  status = 'All';

  selectedTransaction: OutboundTransaction | null = null;

  transactions: OutboundTransaction[] = [];
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
        this.transactions = rows.filter((r: any) => ['OUTBOUND', 'OUTWARD'].includes(String(r.direction).toUpperCase())).map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, date: r.transaction_date, customerName: r.sender_name || '—',
          debitAccount: r.sender_account, beneficiaryName: r.beneficiary_name || '—', beneficiaryAccount: r.beneficiary_account,
          amount: Number(r.amount), status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending', responseCode: r.response_code || '—'
        }));
      },
      error: (error: any) => { this.loading = false; this.errorMessage = error?.error?.message || 'Unable to load outbound transactions.'; }
    });
  }


  get filteredTransactions(): OutboundTransaction[] {

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

          transaction.debitAccount
            .toLowerCase()
            .includes(search) ||

          transaction.beneficiaryName
            .toLowerCase()
            .includes(search) ||

          transaction.beneficiaryAccount
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


  get successCount(): number {
    return this.transactions.filter(
      transaction => transaction.status === 'Success'
    ).length;
  }


  get pendingCount(): number {
    return this.transactions.filter(
      transaction => transaction.status === 'Pending'
    ).length;
  }


  get failedCount(): number {
    return this.transactions.filter(
      transaction => transaction.status === 'Failed'
    ).length;
  }


  viewTransaction(
    transaction: OutboundTransaction
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

}