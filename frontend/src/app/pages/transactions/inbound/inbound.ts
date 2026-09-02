import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { OperationsService } from '../../../services/operations.service';

interface InboundTransaction {
  transactionId: string;
  rrn: string;
  date: string;

  // Sender / Remitter
  remitterName: string;
  remitterAccount: string;
  beneficiaryName: string;
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
export class Inbound implements OnInit {

  // =========================================================
  // SEARCH
  // =========================================================

  searchValue: string = '';

  // =========================================================
  // STATUS FILTER
  // =========================================================

  status: string = 'All';

  // =========================================================
  // SELECTED TRANSACTION
  // =========================================================

  selectedTransaction: InboundTransaction | null = null;

  // =========================================================
  // TRANSACTION DATA
  // =========================================================

  transactions: InboundTransaction[] = [];

  loading: boolean = false;

  errorMessage: string = '';


  constructor(
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

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
          beneficiaryName: r.beneficiary_name || '—', beneficiaryAccount: r.beneficiary_account,
          amount: Number(r.amount),
          status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending',
          responseCode: r.response_code || '—'
        }));
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load inbound transactions.';
        this.cdr.detectChanges();
      }
    });

  }


  // =========================================================
  // FILTERED TRANSACTIONS
  // =========================================================

  get filteredTransactions(): InboundTransaction[] {

    const search =
      this.searchValue
        .trim()
        .toLowerCase();


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


  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  get totalCount(): number {
    return this.transactions.length;
  }


  get successCount(): number {

    return this.transactions.filter(
      transaction =>
        transaction.status === 'Success'
    ).length;

  }


  get pendingCount(): number {

    return this.transactions.filter(
      transaction =>
        transaction.status === 'Pending'
    ).length;

  }


  get failedCount(): number {

    return this.transactions.filter(
      transaction =>
        transaction.status === 'Failed'
    ).length;

  }


  // =========================================================
  // VIEW TRANSACTION
  // =========================================================

  viewTransaction(
    transaction: InboundTransaction
  ): void {

    this.selectedTransaction = transaction;

  }


  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  closeDetails(): void {

    this.selectedTransaction = null;

  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchValue = '';
    this.status = 'All';

  }

}