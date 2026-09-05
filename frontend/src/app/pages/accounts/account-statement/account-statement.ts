import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { finalize } from 'rxjs';

import { OperationsService } from '../../../services/operations.service';

import {
  VALIDATION,
  validDateRange
} from '../../../utils/validation';


@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './account-statement.html',
  styleUrl: './account-statement.css'
})
export class AccountStatement {


  // =========================================
  // SEARCH FIELDS
  // =========================================

  accountNumber = '';

  fromDate = '';

  toDate = '';


  // =========================================
  // FILTERS
  // =========================================

  status = '';

  direction = '';


  // =========================================
  // TRANSACTION DATA
  // =========================================

  rows: any[] = [];


  // =========================================
  // UI STATES
  // =========================================

  errorMessage = '';

  loading = false;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private operations: OperationsService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================
  // FILTERED ROWS
  // =========================================

  get filteredRows(): any[] {

    return this.rows.filter((r: any) => {


      // ---------------------------------------
      // API STATUS
      // ---------------------------------------

      const rowStatus =
        String(
          r.transaction_status ?? ''
        )
          .trim()
          .toUpperCase();


      // ---------------------------------------
      // SELECTED STATUS
      // ---------------------------------------

      const selectedStatus =
        String(
          this.status ?? ''
        )
          .trim()
          .toUpperCase();


      // ---------------------------------------
      // STATUS MATCH
      // ---------------------------------------

      const statusMatch =
        !selectedStatus ||
        rowStatus === selectedStatus;



      // ---------------------------------------
      // API DIRECTION
      // ---------------------------------------

      const rowDirection =
        String(
          r.direction ?? ''
        )
          .trim()
          .toUpperCase();


      // ---------------------------------------
      // SELECTED DIRECTION
      // ---------------------------------------

      const selectedDirection =
        String(
          this.direction ?? ''
        )
          .trim()
          .toUpperCase();


      // ---------------------------------------
      // DIRECTION MATCH
      // ---------------------------------------

      const directionMatch =
        !selectedDirection ||
        rowDirection === selectedDirection;



      // ---------------------------------------
      // BOTH FILTERS
      // ---------------------------------------

      return (
        statusMatch &&
        directionMatch
      );

    });

  }



  // =========================================
  // SEARCH
  // =========================================

  search(): void {

    console.log(
      '================================'
    );

    console.log(
      'SEARCH CLICKED'
    );

    console.log(
      '================================'
    );


    // ---------------------------------------
    // CLEAR OLD DATA
    // ---------------------------------------

    this.errorMessage = '';

    this.rows = [];


    // ---------------------------------------
    // ACCOUNT NUMBER
    // ---------------------------------------

    const account =
      this.accountNumber.trim();


    console.log(
      'ACCOUNT:',
      account
    );


    // =======================================
    // ACCOUNT VALIDATION
    // =======================================

    if (
      !VALIDATION.accountNumber.test(account)
    ) {

      this.errorMessage =
        'Enter a valid account number.';

      this.loading = false;

      this.cdr.detectChanges();

      return;
    }



    // =======================================
    // DATE VALIDATION
    // =======================================

    if (
      !validDateRange(
        this.fromDate,
        this.toDate
      )
    ) {

      this.errorMessage =
        'From date cannot be after To date.';

      this.loading = false;

      this.cdr.detectChanges();

      return;
    }



    // =======================================
    // LOADING START
    // =======================================

    this.loading = true;

    this.cdr.detectChanges();


    console.log(
      'LOADING STARTED'
    );


    console.log(
      'FROM DATE:',
      this.fromDate
    );

    console.log(
      'TO DATE:',
      this.toDate
    );

    console.log(
      'STATUS FILTER:',
      this.status
    );

    console.log(
      'DIRECTION FILTER:',
      this.direction
    );



    // =======================================
    // API CALL
    // =======================================

    this.operations
      .getAccountStatement(
        account,
        this.fromDate,
        this.toDate
      )
      .pipe(

        // -----------------------------------
        // ALWAYS STOP LOADING
        // -----------------------------------

        finalize(() => {

          this.loading = false;

          this.cdr.detectChanges();


          console.log(
            '================================'
          );

          console.log(
            'LOADING STOPPED'
          );

          console.log(
            'TOTAL RECORDS:',
            this.rows.length
          );

          console.log(
            'FILTERED RECORDS:',
            this.filteredRows.length
          );

          console.log(
            '================================'
          );

        })

      )
      .subscribe({


        // ===================================
        // SUCCESS
        // ===================================

        next: (response: any) => {

          console.log(
            '================================'
          );

          console.log(
            'API RESPONSE'
          );

          console.log(response);

          console.log(
            '================================'
          );


          // --------------------------------
          // GET TRANSACTIONS
          // --------------------------------

          this.rows =
            response?.data?.transactions || [];


          console.log(
            'TRANSACTIONS:',
            this.rows
          );


          console.log(
            'TOTAL ROWS:',
            this.rows.length
          );


          console.log(
            'FILTERED ROWS:',
            this.filteredRows.length
          );


          // --------------------------------
          // CLEAR ERROR
          // --------------------------------

          this.errorMessage = '';


          this.cdr.detectChanges();

        },


        // ===================================
        // ERROR
        // ===================================

        error: (error: any) => {

          console.error(
            '================================'
          );

          console.error(
            'API ERROR'
          );

          console.error(error);

          console.error(
            '================================'
          );


          // --------------------------------
          // CLEAR DATA
          // --------------------------------

          this.rows = [];


          // --------------------------------
          // ERROR MESSAGE
          // --------------------------------

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load statement.';


          this.cdr.detectChanges();

        }

      });

  }



  // =========================================
  // CLEAR
  // =========================================

  clear(): void {

    console.log(
      'CLEAR CLICKED'
    );


    // ---------------------------------------
    // CLEAR SEARCH
    // ---------------------------------------

    this.accountNumber = '';

    this.fromDate = '';

    this.toDate = '';


    // ---------------------------------------
    // CLEAR FILTERS
    // ---------------------------------------

    this.status = '';

    this.direction = '';


    // ---------------------------------------
    // CLEAR DATA
    // ---------------------------------------

    this.rows = [];


    // ---------------------------------------
    // CLEAR ERROR
    // ---------------------------------------

    this.errorMessage = '';


    // ---------------------------------------
    // STOP LOADING
    // ---------------------------------------

    this.loading = false;


    this.cdr.detectChanges();

  }



  // =========================================
  // DOWNLOAD STATEMENT
  // =========================================

  downloadStatement(): void {


    // ---------------------------------------
    // CHECK FILTERED RECORDS
    // ---------------------------------------

    if (
      !this.filteredRows ||
      this.filteredRows.length === 0
    ) {

      console.log(
        'No records to download'
      );

      return;
    }



    // =======================================
    // CSV HEADERS
    // =======================================

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



    // =======================================
    // CSV ROWS
    // =======================================

    const csvRows =
      this.filteredRows.map(
        (r: any) => {

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

            this.formatDate(
              r.transaction_date
            )

          ];

        }
      );



    // =======================================
    // CREATE CSV
    // =======================================

    const csvContent = [

      headers,

      ...csvRows

    ]
      .map(
        (row: any[]) => {

          return row
            .map(
              (value: any) => {

                return `"${String(value)
                  .replace(/"/g, '""')}"`;

              }
            )
            .join(',');

        }
      )
      .join('\n');



    // =======================================
    // CREATE FILE
    // =======================================

    const blob =
      new Blob(
        [csvContent],
        {
          type: 'text/csv;charset=utf-8;'
        }
      );



    // =======================================
    // DOWNLOAD
    // =======================================

    const url =
      window.URL.createObjectURL(blob);


    const link =
      document.createElement('a');


    link.href = url;


    link.download =
      `account-statement-${
        this.accountNumber || 'report'
      }.csv`;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    window.URL.revokeObjectURL(url);

  }



  // =========================================
  // DATE FORMAT
  // =========================================

  formatDate(
    value: any
  ): string {


    // ---------------------------------------
    // EMPTY VALUE
    // ---------------------------------------

    if (!value) {

      return '';

    }



    // ---------------------------------------
    // CREATE DATE
    // ---------------------------------------

    const date =
      new Date(value);



    // ---------------------------------------
    // INVALID DATE
    // ---------------------------------------

    if (
      isNaN(
        date.getTime()
      )
    ) {

      return String(value)
        .split(' ')[0];

    }



    // ---------------------------------------
    // DAY
    // ---------------------------------------

    const day =
      String(
        date.getDate()
      )
        .padStart(2, '0');



    // ---------------------------------------
    // MONTH
    // ---------------------------------------

    const month =
      String(
        date.getMonth() + 1
      )
        .padStart(2, '0');



    // ---------------------------------------
    // YEAR
    // ---------------------------------------

    const year =
      date.getFullYear();



    return `${day}-${month}-${year}`;

  }

}