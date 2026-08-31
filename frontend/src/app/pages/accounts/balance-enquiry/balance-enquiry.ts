import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';
import { VALIDATION } from '../../../utils/validation';

@Component({
  selector: 'app-balance-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance-enquiry.html',
  styleUrl: './balance-enquiry.css'
})
export class BalanceEnquiry {

  accountNumber = '';
  account: any = null;
  errorMessage = '';
  loading = false;

  constructor(private operations: OperationsService) {}

  search(): void {

    this.errorMessage = '';
    this.account = null;

    const accountNo = this.accountNumber.trim();

    // Validation
    if (!/^\d{9,18}$/.test(accountNo)) {
      this.errorMessage = 'Enter a valid 9–18 digit account number.';
      return;
    }

    this.loading = true;

    this.operations.getAccounts(accountNo).subscribe({
      next: (response: any) => {

        console.log('Balance API Response:', response);

        this.loading = false;

        if (response?.data && response.data.length > 0) {
          this.account = response.data[0];
        } else {
          this.errorMessage = 'Account not found.';
        }
      },

      error: (error: any) => {

        console.error('Balance API Error:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load account.';
      }
    });
  }

  clear(): void {
    this.accountNumber = '';
    this.account = null;
    this.errorMessage = '';
  }
}