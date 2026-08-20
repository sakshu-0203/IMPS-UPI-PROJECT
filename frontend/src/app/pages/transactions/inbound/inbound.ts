import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface InboundTransaction {
  transactionId: string;
  rrn: string;
  date: string;
  remitterName: string;
  remitterAccount: string;
  beneficiaryAccount: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  responseCode: string;
}

@Component({
  selector: 'app-inbound',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './inbound.html',
  styleUrl: './inbound.css'
})
export class Inbound {

  // Search box
  searchValue: string = '';

  // Status filter
  status: string = 'All';

  // Selected transaction for details panel
  selectedTransaction: InboundTransaction | null = null;


  // --------------------------------------------------
  // INBOUND TRANSACTION DATA
  // Later this data will come from Node.js API
  // --------------------------------------------------

  transactions: InboundTransaction[] = [];
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
        this.transactions = rows.filter((r: any) => ['INBOUND', 'INWARD'].includes(String(r.direction).toUpperCase())).map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, date: r.transaction_date,
          remitterName: r.sender_name || '—', remitterAccount: r.sender_account,
          beneficiaryAccount: r.beneficiary_account, amount: Number(r.amount),
          status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending',
          responseCode: r.response_code || '—'
        }));
      },
      error: (error: any) => { this.loading = false; this.errorMessage = error?.error?.message || 'Unable to load inbound transactions.'; }
    });
  }


  // --------------------------------------------------
  // FILTERED TRANSACTIONS
  // --------------------------------------------------

  get filteredTransactions(): InboundTransaction[] {

    const search =
      this.searchValue.trim().toLowerCase();

    return this.transactions.filter(
      (transaction: InboundTransaction) => {

        const matchesSearch =
          !search ||

          transaction.transactionId
            .toLowerCase()
            .includes(search) ||

          transaction.rrn
            .toLowerCase()
            .includes(search) ||

          transaction.remitterName
            .toLowerCase()
            .includes(search) ||

          transaction.remitterAccount
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


  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------

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


  // --------------------------------------------------
  // VIEW TRANSACTION
  // --------------------------------------------------

  viewTransaction(
    transaction: InboundTransaction
  ): void {

    this.selectedTransaction = transaction;

  }


  // --------------------------------------------------
  // CLOSE DETAILS
  // --------------------------------------------------

  closeDetails(): void {

    this.selectedTransaction = null;

  }


  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  clearFilters(): void {

    this.searchValue = '';

    this.status = 'All';

  }

}