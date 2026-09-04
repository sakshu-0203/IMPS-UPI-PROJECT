import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OperationsService } from '../../../services/operations.service';
import {
  VALIDATION,
  validDateRange
} from '../../../utils/validation';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-statement.html',
  styleUrl: './account-statement.css'
})
export class AccountStatement {

  accountNumber = '';
  fromDate = '';
  toDate = '';

  rows: any[] = [];
  errorMessage = '';
  loading = false;

  constructor(
    private operations: OperationsService,
    private cdr: ChangeDetectorRef
  ) { }

  search(): void {

    console.log('SEARCH CLICKED');

    this.errorMessage = '';
    this.rows = [];

    const account = this.accountNumber.trim();

    // ACCOUNT NUMBER VALIDATION
    if (!VALIDATION.accountNumber.test(account)) {

      this.errorMessage = 'Enter a valid account number.';

      this.loading = false;

      this.cdr.detectChanges();

      return;
    }

    // DATE VALIDATION
    if (!validDateRange(this.fromDate, this.toDate)) {

      this.errorMessage =
        'From date cannot be after To date.';

      this.loading = false;

      this.cdr.detectChanges();

      return;
    }

    // START LOADING
    this.loading = true;

    this.cdr.detectChanges();

    console.log('Loading started...');

    this.operations.getAccountStatement(
      account,
      this.fromDate,
      this.toDate
    ).subscribe({

      // ================================
      // SUCCESS
      // ================================

      next: (response: any) => {

        console.log(
          '========== API RESPONSE =========='
        );

        console.log(response);

        /*
         * Get transactions from API response
         */
        this.rows =
          response?.data?.transactions || [];

        console.log(
          'ROWS:',
          this.rows
        );

        /*
         * Stop loading
         */
        this.loading = false;

        /*
         * Force Angular UI update
         */
        this.cdr.detectChanges();

        console.log(
          'LOADING:',
          this.loading
        );

        console.log(
          'UI UPDATED - ROW COUNT:',
          this.rows.length
        );
      },

      // ================================
      // ERROR
      // ================================

      error: (error: any) => {

        console.error(
          '========== API ERROR =========='
        );

        console.error(error);

        /*
         * Stop loading
         */
        this.loading = false;

        /*
         * Clear rows
         */
        this.rows = [];

        /*
         * Error message
         */
        this.errorMessage =
          error?.error?.message ||
          'Unable to load statement.';

        /*
         * Force Angular UI update
         */
        this.cdr.detectChanges();
      },

      // ================================
      // COMPLETE
      // ================================

      complete: () => {

        console.log(
          '========== REQUEST COMPLETE =========='
        );

        /*
         * Make sure loading is OFF
         */
        this.loading = false;

        this.cdr.detectChanges();
      }

    });
  }


  // ================================
  // CLEAR
  // ================================

  clear(): void {

    this.accountNumber = '';
    this.fromDate = '';
    this.toDate = '';

    this.rows = [];

    this.errorMessage = '';

    this.loading = false;

    this.cdr.detectChanges();
  }


  // ================================
  // DOWNLOAD STATEMENT
  // ================================

  downloadStatement(): void {

    if (!this.rows || this.rows.length === 0) {
      return;
    }

  const headers = [
  'Transaction ID',
  'RRN',
  'Direction',
  'Sender Name',
  'Sender Account',
  'Beneficiary Name',
  'Beneficiary Account',
  'Amount',
  'Status',
  'Date'
];

    const csvRows = this.rows.map((r: any) => {

      return [
  r.transaction_id ?? '',
  r.rrn ?? '',
  r.direction ?? '',
  r.customer_name ?? '',
  r.sender_account ?? '',
  r.beneficiary_name ?? '',
  r.beneficiary_account ?? '',
  r.amount ?? '',
  r.transaction_status ?? '',
  this.formatDate(r.transaction_date)
];

    });

    const csvContent = [
      headers,
      ...csvRows
    ]
      .map(row =>
        row
          .map((value: any) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');


    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );


    const url =
      window.URL.createObjectURL(blob);


    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `account-statement-${this.accountNumber || 'report'}.csv`;

    link.click();


    window.URL.revokeObjectURL(url);
  }


  // ================================
  // DATE FORMAT
  // ================================

  formatDate(value: any): string {

    if (!value) {
      return '';
    }

    const date = new Date(value);

    /*
     * If date is invalid,
     * return only date portion
     */
    if (isNaN(date.getTime())) {

      return String(value).split(' ')[0];
    }


    const day =
      String(date.getDate()).padStart(2, '0');

    const month =
      String(date.getMonth() + 1).padStart(2, '0');

    const year =
      date.getFullYear();


    return `${day}-${month}-${year}`;
  }

}