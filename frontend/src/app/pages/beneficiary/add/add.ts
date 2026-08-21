import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { OperationsService } from '../../../services/operations.service';

import { VALIDATION, required } from '../../../utils/validation';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class Add {

  customerName = '';

  accountNumber = '';

  ifscCode = '';

  bankName = '';

  mobileNumber = '';

  errorMessage = '';

  successMessage = '';

  loading = false;

  fieldErrors: Record<string, string> = {};


  constructor(
    private operations: OperationsService
  ) {}


  submit(): void {

    this.errorMessage = '';

    this.successMessage = '';

    this.fieldErrors = {};


    // Beneficiary Name validation
    if (
      !required(this.customerName) ||
      !VALIDATION.name.test(this.customerName.trim())
    ) {
      this.fieldErrors['customerName'] =
        'Enter a valid beneficiary name.';
    }


    // Account Number validation
    if (
      !required(this.accountNumber) ||
      !VALIDATION.accountNumber.test(this.accountNumber.trim())
    ) {
      this.fieldErrors['accountNumber'] =
        'Enter a valid account number.';
    }


    // IFSC validation
    if (
      !required(this.ifscCode) ||
      !VALIDATION.ifsc.test(
        this.ifscCode.trim().toUpperCase()
      )
    ) {
      this.fieldErrors['ifscCode'] =
        'Enter a valid 11-character IFSC.';
    }


    // Mobile Number validation
    if (
      this.mobileNumber &&
      !VALIDATION.mobile.test(
        this.mobileNumber.trim()
      )
    ) {
      this.fieldErrors['mobileNumber'] =
        'Enter a valid 10-digit mobile number.';
    }


    // Bank Name validation
    if (this.bankName.length > 150) {
      this.fieldErrors['bankName'] =
        'Bank name is too long.';
    }


    // Stop submission if validation errors exist
    if (Object.keys(this.fieldErrors).length) {

      this.errorMessage =
        'Please correct the highlighted fields.';

      return;
    }


    // Start API request
    this.loading = true;


    const beneficiaryData = {

      customerName:
        this.customerName.trim(),

      accountNumber:
        this.accountNumber.trim().toUpperCase(),

      ifscCode:
        this.ifscCode.trim().toUpperCase(),

      bankName:
        this.bankName.trim(),

      mobileNumber:
        this.mobileNumber.trim()
    };


    this.operations
      .addBeneficiary(beneficiaryData)
      .subscribe({

        next: (r) => {

          this.loading = false;


          if (r?.success) {

            this.successMessage =
              r.message;

            this.reset(false);

          } else {

            this.errorMessage =
              r?.message ||
              'Unable to add beneficiary.';
          }
        },


        error: (e) => {

          this.loading = false;

          this.errorMessage =
            e?.error?.message ||
            'Unable to connect to backend.';
        }
      });
  }


  reset(clearMessage = true): void {

    this.customerName = '';

    this.accountNumber = '';

    this.ifscCode = '';

    this.bankName = '';

    this.mobileNumber = '';

    this.fieldErrors = {};


    if (clearMessage) {

      this.errorMessage = '';
    }
  }
}