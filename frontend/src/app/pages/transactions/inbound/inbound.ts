import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface InboundTransaction {
  transactionId: string;
  rrn: string;
  date: string;

  // Sender / Remitter
  remitterName: string;
  remitterAccount: string;

  // Receiver / Beneficiary
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


  // =========================================================
  // PAGE INIT
  // =========================================================

  ngOnInit(): void {
    this.loadTransactions();
  }


  // =========================================================
  // LOAD INBOUND TRANSACTIONS
  // =========================================================

  loadTransactions(): void {

    this.loading = true;
    this.errorMessage = '';

    this.transactionService.getTransactions().subscribe({

      next: (response: any) => {

        console.log('[Inbound] API Response:', response);

        const rows = Array.isArray(response?.data)
          ? response.data
          : [];


        // =====================================================
        // FILTER ONLY INBOUND / INWARD
        // =====================================================

        this.transactions = rows

          .filter((r: any) => {

            const direction = String(
              r?.direction || ''
            )
              .trim()
              .toUpperCase();

            return (
              direction === 'INBOUND' ||
              direction === 'INWARD'
            );

          })


          // ===================================================
          // MAP API RESPONSE
          // ===================================================

          .map((r: any) => {

            const apiStatus = String(
              r?.transaction_status || ''
            )
              .trim()
              .toUpperCase();


            let status: 'Success' | 'Pending' | 'Failed';

            if (apiStatus === 'SUCCESS') {

              status = 'Success';

            } else if (apiStatus === 'FAILED') {

              status = 'Failed';

            } else {

              status = 'Pending';

            }


            return {

              // ------------------------------------------------
              // TRANSACTION
              // ------------------------------------------------

              transactionId:
                r?.transaction_id || '—',

              rrn:
                r?.rrn || '—',

              date:
                r?.transaction_date || '—',


              // ------------------------------------------------
              // REMITTER / SENDER
              // ------------------------------------------------

              remitterName:
                r?.sender_name || '—',

              remitterAccount:
                r?.sender_account || '—',


              // ------------------------------------------------
              // BENEFICIARY / RECEIVER
              // ------------------------------------------------

              beneficiaryName:
                r?.beneficiary_name || '—',

              beneficiaryAccount:
                r?.beneficiary_account || '—',


              // ------------------------------------------------
              // AMOUNT
              // ------------------------------------------------

              amount:
                Number(r?.amount || 0),


              // ------------------------------------------------
              // STATUS
              // ------------------------------------------------

              status,


              // ------------------------------------------------
              // RESPONSE CODE
              // ------------------------------------------------

              responseCode:
                r?.response_code || '—'

            };

          });


        console.log(
          '[Inbound] Loaded transactions:',
          this.transactions
        );

        this.loading = false;

        this.cdr.detectChanges();

      },


      error: (error: any) => {

        console.error(
          '[Inbound] API Error:',
          error
        );

        this.loading = false;

        this.transactions = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to load inbound transactions.';

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