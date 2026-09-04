
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { OperationsService } from '../../../services/operations.service';

@Component({
  selector: 'app-settlement-reports',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './settlement-reports.html',
  styleUrl: './settlement-reports.css'
})
export class SettlementReports implements OnInit {

  rows: any[] = [];
  errorMessage = '';
  loading = false;

  constructor(private ops: OperationsService) {}

  ngOnInit(): void {
    console.log('Settlement page loaded');
    this.load();
  }

  load(): void {

    console.log('Calling settlement API...');

    this.loading = true;
    this.errorMessage = '';

    this.ops.getSettlementReport().subscribe({

      next: (response: any) => {

        console.log('SETTLEMENT API RESPONSE:', response);

        this.loading = false;

        if (response && response.success) {
          this.rows = response.data || [];

          console.log('Settlement rows:', this.rows);
        } else {
          this.rows = [];
          this.errorMessage =
            response?.message || 'No settlement data found.';
        }
      },

      error: (error: any) => {

        console.error('SETTLEMENT API ERROR:', error);

        this.loading = false;
        this.rows = [];

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load settlement report.';
      },

      complete: () => {
        console.log('Settlement API request completed');
      }

    });
  }
}

