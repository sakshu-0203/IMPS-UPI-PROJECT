import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { OperationsService } from '../../../services/operations.service';

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

  constructor(
    private transactionService: TransactionService,
    private operationsService: OperationsService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    
    const fetchWithAccounts = (userAccounts: string[]) => {
      this.transactionService.getTransactions().subscribe({
        next: (response: any) => {
          this.loading = false;
          const rows = Array.isArray(response?.data) ? response.data : [];
          
          // Filter: show transactions where direction is INBOUND OR where we are the beneficiary
          this.transactions = rows.filter((r: any) => 
            ['INBOUND', 'INWARD'].includes(String(r.direction).toUpperCase()) ||
            userAccounts.includes(r.beneficiary_account)
          ).map((r: any) => ({
            transactionId: r.transaction_id, 
            rrn: r.rrn, 
            date: r.transaction_date,
            remitterName: r.sender_name || '—', 
            remitterAccount: r.sender_account,
            beneficiaryAccount: r.beneficiary_account, 
            amount: Number(r.amount),
            status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : 
                    String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending',
            responseCode: r.response_code || '—'
          }));
        },
        error: (error: any) => { 
          this.loading = false; 
          this.errorMessage = error?.error?.message || 'Unable to load inbound transactions.'; 
        }
      });
    };

    // First get the user's accounts, then fetch transactions to filter received ones
    this.operationsService.getAccounts().subscribe({
      next: (accRes: any) => {
        const userAccounts = (accRes?.data || []).map((a: any) => a.account_number);
        // Fallback accounts in case API doesn't return them (matching new-transfer logic)
        if (userAccounts.length === 0) {
          userAccounts.push('123456789012', '123456789013', '123456789014');
        }
        fetchWithAccounts(userAccounts);
      },
      error: () => {
        // Continue with fallback accounts if API fails
        fetchWithAccounts(['123456789012', '123456789013', '123456789014']);
      }
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