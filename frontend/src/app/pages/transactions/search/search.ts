import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionService } from '../../../services/transaction.service';
import { VALIDATION } from '../../../utils/validation';


@Component({

  selector: 'app-search',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './search.html',

  styleUrl: './search.css'

})
export class Search {


  transactionId = '';

  rrn = '';

  account = '';

  mobile = '';

  status = '';


  transactions: any[] = [];


  loading = false;

  searched = false;

  errorMessage = '';


  constructor(
    private transactionService:
      TransactionService
  ) {}


  search(): void {

    this.errorMessage = '';
    const transactionId = this.transactionId.trim();
    const rrn = this.rrn.trim();
    const account = this.account.trim();
    const mobile = this.mobile.trim();
    if (!transactionId && !rrn && !account && !mobile && !this.status) {
      this.errorMessage = 'Enter at least one search criterion.';
      return;
    }
    if (transactionId && !VALIDATION.transactionId.test(transactionId)) { this.errorMessage = 'Invalid transaction ID format.'; return; }
    if (rrn && !VALIDATION.rrn.test(rrn)) { this.errorMessage = 'RRN must contain 6–20 digits.'; return; }
    if (account && !VALIDATION.accountNumber.test(account.toUpperCase())) { this.errorMessage = 'Invalid account number format.'; return; }
    if (mobile && !VALIDATION.mobile.test(mobile)) { this.errorMessage = 'Enter a valid 10-digit mobile number.'; return; }

    this.loading = true;

    this.searched = true;

    this.errorMessage = '';


    const filters = {

      transactionId:
        this.transactionId.trim(),

      rrn:
        this.rrn.trim(),

      account:
        this.account.trim(),

      mobile:
        this.mobile.trim(),

      status:
        this.status

    };


    this.transactionService
      .searchTransactions(filters)
      .subscribe({

        next: (response) => {

          this.loading = false;


          if (response.success) {

            this.transactions =
              response.data || [];

          } else {

            this.transactions = [];

            this.errorMessage =
              response.message ||
              'Search failed.';

          }

        },


        error: (error) => {

          this.loading = false;

          console.error(
            'Search error:',
            error
          );

          this.transactions = [];

          this.errorMessage =
            'Unable to connect to backend.';

        }

      });

  }


  clear(): void {

    this.transactionId = '';

    this.rrn = '';

    this.account = '';

    this.mobile = '';

    this.status = '';

    this.transactions = [];

    this.errorMessage = '';

    this.searched = false;

  }


  formatAmount(
    amount: number
  ): string {

    return Number(amount || 0)
      .toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );

  }

}