import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { OperationsService } from '../../../services/operations.service';

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
export class Outbound implements OnInit {

  searchValue = '';
  status = 'All';

  selectedTransaction: OutboundTransaction | null = null;

  transactions: OutboundTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private transactionService: TransactionService,
    private operationsService: OperationsService,
    private cdr: ChangeDetectorRef
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
          
          // Filter: show transactions where direction is OUTBOUND
          this.transactions = rows.filter((r: any) => 
            ['OUTBOUND', 'OUTWARD'].includes(String(r.direction).toUpperCase())
          ).map((r: any) => ({
            transactionId: r.transaction_id, 
            rrn: r.rrn, 
            date: r.transaction_date, 
            customerName: r.sender_name || '—',
            debitAccount: r.sender_account, 
            beneficiaryName: r.beneficiary_name || '—', 
            beneficiaryAccount: r.beneficiary_account,
            amount: Number(r.amount), 
            status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : 
                    String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending', 
            responseCode: r.response_code || '—'
          }));
          
          this.cdr.detectChanges();
        },
        error: (error: any) => { 
          this.loading = false; 
          this.errorMessage = error?.error?.message || 'Unable to load outbound transactions.'; 
          this.cdr.detectChanges();
        }
      });
    };

    // First get the user's accounts, then fetch transactions to filter sent ones
    this.operationsService.getAccounts().subscribe({
      next: (accRes: any) => {
        const userAccounts = (accRes?.data || []).map((a: any) => a.account_number);
        // Fallback accounts matching new-transfer logic
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