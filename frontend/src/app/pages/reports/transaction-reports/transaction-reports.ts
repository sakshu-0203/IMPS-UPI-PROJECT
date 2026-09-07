
import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OperationsService } from '../../../services/operations.service';


@Component({
    selector: 'app-transaction-reports',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule
    ],

    templateUrl: './transaction-reports.html',
    styleUrl: './transaction-reports.css'
})


export class TransactionReports implements OnInit {

    // Complete list from database
    allRows: any[] = [];

    // List displayed in table
    rows: any[] = [];


    // Status & Direction filters
    status: string = '';
    direction: string = '';


    // Date filters
    fromDate: string = '';
    toDate: string = '';

    // Month filter
    selectedMonth: string = '';


    errorMessage: string = '';

    loading: boolean = true;


    constructor(
        private ops: OperationsService,
        private cdr: ChangeDetectorRef
    ) { }


    ngOnInit(): void {

        // Page open → load ALL records
        this.loadAll();

    }


    // =========================================================
    // LOAD ALL TRANSACTIONS
    // =========================================================

    loadAll(): void {

        this.loading = true;
        this.errorMessage = '';


        this.ops.getTransactionReport('', '').subscribe({

            next: (response: any) => {

                console.log(
                    'Transaction report response:',
                    response
                );


                if (response?.success) {

                    this.allRows = response.data || [];

                    // Page open → show ALL records
                    this.rows = [...this.allRows];


                    console.log(
                        'Rows loaded:',
                        this.rows.length
                    );

                } else {

                    this.allRows = [];
                    this.rows = [];

                    this.errorMessage =
                        response?.message ||
                        'Unable to load report.';
                }


                this.loading = false;

                this.cdr.detectChanges();

            },


            error: (error: any) => {

                console.error(
                    'Transaction report error:',
                    error
                );


                this.allRows = [];
                this.rows = [];

                this.loading = false;


                this.errorMessage =
                    error?.error?.message ||
                    'Unable to load report.';


                this.cdr.detectChanges();

            }

        });

    }


    // =========================================================
    // APPLY FILTER
    // =========================================================

    applyFilter(): void {

        const selectedStatus =
            this.status
                .trim()
                .toUpperCase();


        const selectedDirection =
            this.direction
                .trim()
                .toUpperCase();


        this.rows = this.allRows.filter(
            (transaction: any) => {


                // ---------------------------------------------
                // STATUS
                // ---------------------------------------------

                const transactionStatus =
                    String(
                        transaction.transaction_status ?? ''
                    )
                        .trim()
                        .toUpperCase();


                const statusMatch =
                    selectedStatus === '' ||
                    transactionStatus === selectedStatus;


                // ---------------------------------------------
                // DIRECTION
                // ---------------------------------------------

                const transactionDirection =
                    String(
                        transaction.direction ?? ''
                    )
                        .trim()
                        .toUpperCase();


                const directionMatch =
                    selectedDirection === '' ||
                    transactionDirection === selectedDirection;


                // ---------------------------------------------
                // DATE
                // ---------------------------------------------

                let dateMatch = true;


                if (this.fromDate || this.toDate) {

                    const transactionDate =
                        new Date(
                            transaction.transaction_date
                        );


                    if (isNaN(transactionDate.getTime())) {

                        return false;

                    }


                    // FROM DATE
                    if (this.fromDate) {

                        const from =
                            new Date(this.fromDate);

                        from.setHours(
                            0, 0, 0, 0
                        );


                        if (transactionDate < from) {

                            dateMatch = false;

                        }

                    }


                    // TO DATE
                    if (this.toDate) {

                        const to =
                            new Date(this.toDate);

                        to.setHours(
                            23, 59, 59, 999
                        );


                        if (transactionDate > to) {

                            dateMatch = false;

                        }

                    }

                }


                // ---------------------------------------------
                // MONTH
                // ---------------------------------------------

                let monthMatch = true;


                if (this.selectedMonth) {

                    const transactionDate =
                        new Date(
                            transaction.transaction_date
                        );


                    const transactionMonth =
                        transactionDate
                            .toISOString()
                            .substring(0, 7);


                    monthMatch =
                        transactionMonth ===
                        this.selectedMonth;

                }


                return (
                    statusMatch &&
                    directionMatch &&
                    dateMatch &&
                    monthMatch
                );

            }
        );


        this.cdr.detectChanges();

    }


    // =========================================================
    // CLEAR
    // =========================================================

    clear(): void {

        this.status = '';

        this.direction = '';

        this.fromDate = '';

        this.toDate = '';

        this.selectedMonth = '';


        // Show ALL records again
        this.rows = [...this.allRows];


        this.cdr.detectChanges();

    }


    // =========================================================
    // DOWNLOAD CSV
    // =========================================================

    downloadReport(): void {

        if (!this.rows || this.rows.length === 0) {

            alert('No transactions available to download.');

            return;

        }


        const headers = [
            'Transaction ID',
            'RRN',
            'Transaction Type',
            'Direction',
            'Amount',
            'Status',
            'Transaction Date'
        ];


        const csvRows: string[] = [];


        // Header
        csvRows.push(
            headers.join(',')
        );


        // Data
        this.rows.forEach(
            (transaction: any) => {

                const row = [

                    this.escapeCsv(
                        transaction.transaction_id
                    ),

                    this.escapeCsv(
                        transaction.rrn
                    ),

                    this.escapeCsv(
                        transaction.transaction_type
                    ),

                    this.escapeCsv(
                        transaction.direction
                    ),

                    this.escapeCsv(
                        transaction.amount
                    ),

                    this.escapeCsv(
                        transaction.transaction_status
                    ),

                    this.escapeCsv(
                        transaction.transaction_date
                    )

                ];


                csvRows.push(
                    row.join(',')
                );

            }
        );


        // Create CSV
        const csvContent =
            '\uFEFF' +
            csvRows.join('\r\n');


        const blob =
            new Blob(
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


        // File name
        const date =
            new Date()
                .toISOString()
                .slice(0, 10);


        link.download =
            `transaction-report-${date}.csv`;


        link.click();


        window.URL.revokeObjectURL(url);

    }


    // =========================================================
    // CSV ESCAPE
    // =========================================================

    private escapeCsv(value: any): string {

        if (
            value === null ||
            value === undefined
        ) {

            return '';

        }


        const text =
            String(value);


        return `"${text.replace(
            /"/g,
            '""'
        )}"`;

    }

}
