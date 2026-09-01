import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';

@Component({
  selector: 'app-balance-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance-enquiry.html',
  styleUrl: './balance-enquiry.css'
})
export class BalanceEnquiry implements OnInit {

  // Account number entered in search box
  accountNumber = '';

  // All accounts loaded from backend
  allAccounts: any[] = [];

  // Accounts displayed in result list
  accounts: any[] = [];

  // Currently selected account
  selectedAccount: any = null;

  errorMessage = '';

  loading = false;

  // Popup visibility
  showBalanceModal = false;


  constructor(
    private operations: OperationsService
  ) { }


  ngOnInit(): void {
    this.loadAccounts();
  }


  /*
   * Load all accounts once from backend.
   */
  loadAccounts(): void {

    this.loading = true;
    this.errorMessage = '';

    this.operations.getAccounts('').subscribe({

      next: (response: any) => {

        this.loading = false;

        const rows = Array.isArray(response?.data)
          ? response.data
          : [];

        this.allAccounts = rows;

        // Initially don't show any accounts
        this.accounts = [];

      },

      error: (error: any) => {

        this.loading = false;

        this.allAccounts = [];
        this.accounts = [];

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load accounts.';
      }

    });
  }


  /*
   * Search matching accounts.
   *
   * Example:
   *
   * 1    -> accounts starting with 1
   * 12   -> accounts starting with 12
   * 123  -> accounts starting with 123
   */
  search(): void {

    this.errorMessage = '';

    const searchValue = this.accountNumber
      .trim()
      .replace(/\D/g, '');


    // Nothing entered
    if (!searchValue) {

      this.accounts = [];

      this.selectedAccount = null;

      this.showBalanceModal = false;

      return;
    }


    /*
     * Find matching accounts.
     */
    const matchingAccounts = this.allAccounts.filter(
      (account: any) => {

        const accountNo = String(
          account?.account_number ?? ''
        ).replace(/\s+/g, '');

        return accountNo.startsWith(searchValue);

      }
    );


    /*
     * If exact account number is found,
     * open balance popup directly.
     */
    const exactAccount = this.allAccounts.find(
      (account: any) => {

        const accountNo = String(
          account?.account_number ?? ''
        ).replace(/\s+/g, '');

        return accountNo === searchValue;

      }
    );


    if (exactAccount) {

      this.selectedAccount = exactAccount;

      // Account list hide
      this.accounts = [];

      // Search box clear
      this.accountNumber = '';

      // Open popup
      this.showBalanceModal = true;

      return;
    }


    /*
     * If exact account is not found,
     * show matching account list.
     */
    this.accounts = matchingAccounts;

    this.selectedAccount = null;

    this.showBalanceModal = false;


    if (this.accounts.length === 0) {

      this.errorMessage =
        'No matching account found.';

    }

  }


  /*
   * Search while typing.
   *
   * This only displays matching accounts.
   * Popup will open only when Search button is clicked
   * after an exact account number is selected/entered.
   */
  onAccountNumberInput(): void {

    const searchValue = this.accountNumber
      .trim()
      .replace(/\D/g, '');


    this.errorMessage = '';

    this.selectedAccount = null;

    this.showBalanceModal = false;


    if (!searchValue) {

      this.accounts = [];

      return;
    }


    this.accounts = this.allAccounts.filter(
      (account: any) => {

        const accountNo = String(
          account?.account_number ?? ''
        ).replace(/\s+/g, '');

        return accountNo.startsWith(searchValue);

      }
    );

  }


  /*
   * Select account from result list.
   *
   * When user clicks an account,
   * its account number goes into the search box.
   */
  selectAccount(account: any): void {

    if (!account) {
      return;
    }

    this.selectedAccount = account;

    this.accountNumber = String(
      account.account_number ?? ''
    );

    this.accounts = [];

    this.errorMessage = '';
  }


  /*
   * Check whether this account is selected.
   */
  isSelected(account: any): boolean {

    if (!account || !this.selectedAccount) {
      return false;
    }


    return String(
      account?.account_number ?? ''
    ) === String(
      this.selectedAccount?.account_number ?? ''
    );

  }


  /*
   * Close balance popup.
   */
  closeBalanceModal(): void {

    this.showBalanceModal = false;

  }


  /*
   * Clear search and selection.
   */
  clear(): void {

    this.accountNumber = '';

    this.accounts = [];

    this.selectedAccount = null;

    this.errorMessage = '';

    this.showBalanceModal = false;

  }

}