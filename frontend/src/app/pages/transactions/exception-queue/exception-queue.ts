import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface ExceptionTransaction {
  transactionId: string;
  rrn: string;
  date: string;
  customerName: string;
  accountNumber: string;
  amount: number;
  exceptionType: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  responseCode: string;
}

@Component({
  selector: 'app-exception-queue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './exception-queue.html',
  styleUrl: './exception-queue.css'
})
export class ExceptionQueue {

  searchValue = '';
  status = 'All';
  priority = 'All';

  selectedException: ExceptionTransaction | null = null;


  transactions: ExceptionTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void { this.loadExceptions(); }

  loadExceptions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows.filter((r: any) => String(r.transaction_status).toUpperCase() === 'FAILED').map((r: any) => ({
          transactionId:r.transaction_id, rrn:r.rrn, date:r.transaction_date, customerName:r.sender_name || '—', accountNumber:r.sender_account, amount:Number(r.amount), exceptionType:r.response_message || 'Transaction failed', priority:Number(r.amount)>=25000?'High':Number(r.amount)>=10000?'Medium':'Low', status:'Open', responseCode:r.response_code || '—'
        }));
      },
      error:(error:any)=>{this.loading=false;this.errorMessage=error?.error?.message||'Unable to load exception queue.';}
    });
  }


  get filteredTransactions(): ExceptionTransaction[] {

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
            .includes(search) ||

          transaction.exceptionType
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          this.status === 'All' ||
          transaction.status === this.status;


        const matchesPriority =
          this.priority === 'All' ||
          transaction.priority === this.priority;


        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );

      }
    );

  }


  get totalCount(): number {

    return this.transactions.length;

  }


  get openCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Open'
    ).length;

  }


  get inProgressCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'In Progress'
    ).length;

  }


  get resolvedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Resolved'
    ).length;

  }


  get highPriorityCount(): number {

    return this.transactions.filter(
      transaction => transaction.priority === 'High'
    ).length;

  }


  viewException(
    transaction: ExceptionTransaction
  ): void {

    this.selectedException = transaction;

  }


  closeDetails(): void {

    this.selectedException = null;

  }


  clearFilters(): void {

    this.searchValue = '';
    this.status = 'All';
    this.priority = 'All';

  }


  markInProgress(
    transaction: ExceptionTransaction
  ): void {

    transaction.status = 'In Progress';

  }


  resolveException(
    transaction: ExceptionTransaction
  ): void {

    transaction.status = 'Resolved';

  }

}