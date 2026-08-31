import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { normalizeTransactionDirection } from '../../../utils/validation';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const targetId = params['id'] || params['transactionId'] || params['txnId'] || params['rrn'];
      this.loadTransactions(targetId);
    });
  }

  loadTransactions(targetId?: string): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows
          .filter((r: any) => normalizeTransactionDirection(r) === 'OUTBOUND')
          .map((r: any) => this.mapToOutbound(r));

        if (targetId) {
          const cleanId = String(targetId).trim().toLowerCase();
          const found = this.transactions.find(
            t => t.transactionId.toLowerCase() === cleanId || t.rrn.toLowerCase() === cleanId
          );
          if (found) {
            this.selectedTransaction = found;
          } else {
            this.loadSingleTransaction(targetId);
          }
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load outbound transactions.';
        if (targetId) {
          this.loadSingleTransaction(targetId);
        }
      }
    });
  }

  private loadSingleTransaction(targetId: string): void {
    this.transactionService.getTransactionById(targetId).subscribe({
      next: (res: any) => {
        if (res?.success && res.data) {
          const mapped = this.mapToOutbound(res.data);
          this.selectedTransaction = mapped;
          if (!this.transactions.some(t => t.transactionId.toLowerCase() === mapped.transactionId.toLowerCase())) {
            this.transactions.unshift(mapped);
          }
        }
      },
      error: () => {}
    });
  }

  private mapToOutbound(r: any): OutboundTransaction {
    return {
      transactionId: r.transaction_id || r.transactionId || '—',
      rrn: r.rrn || '—',
      date: r.transaction_date || r.date || new Date().toISOString(),
      customerName: r.sender_name || r.customerName || '—',
      debitAccount: r.sender_account || r.debitAccount || '—',
      beneficiaryName: r.beneficiary_name || r.beneficiaryName || '—',
      beneficiaryAccount: r.beneficiary_account || r.beneficiaryAccount || '—',
      amount: Number(r.amount || 0),
      status: String(r.transaction_status || r.status).toUpperCase() === 'SUCCESS' ? 'Success' : String(r.transaction_status || r.status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending',
      responseCode: r.response_code || r.responseCode || '—'
    };
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