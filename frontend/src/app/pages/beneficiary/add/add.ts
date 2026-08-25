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

  // =====================================================
  // FORM FIELDS
  // =====================================================

  customerName = '';

  accountNumber = '';

  ifscCode = '';

  bankName = '';

  mobileNumber = '';


  // =====================================================
  // PAGE STATE
  // =====================================================

  errorMessage = '';

  successMessage = '';

  loading = false;


  // =====================================================
  // FIELD VALIDATION ERRORS
  // =====================================================

  fieldErrors: Record<string, string> = {};


  constructor(
    private operations: OperationsService
  ) {}


  // =====================================================
  // SUBMIT
  // =====================================================

  submit(): void {

    // Clear previous messages
    this.errorMessage = '';

    this.successMessage = '';

    this.fieldErrors = {};


    // ===================================================
    // BENEFICIARY NAME
    // ===================================================

    if (
      !required(this.customerName) ||
      !VALIDATION.name.test(
        this.customerName.trim()
      )
    ) {

      this.fieldErrors['customerName'] =
        'Enter a valid beneficiary name.';
    }


    // ===================================================
    // ACCOUNT NUMBER
    // ===================================================

    if (
      !required(this.accountNumber) ||
      !VALIDATION.accountNumber.test(
        this.accountNumber.trim()
      )
    ) {

      this.fieldErrors['accountNumber'] =
        'Enter a valid account number.';
    }


    // ===================================================
    // IFSC
    // ===================================================

    if (
      !required(this.ifscCode) ||
      !VALIDATION.ifsc.test(
        this.ifscCode.trim().toUpperCase()
      )
    ) {

      this.fieldErrors['ifscCode'] =
        'Enter a valid 11-character IFSC.';
    }


    // ===================================================
    // MOBILE
    // ===================================================

    if (
      this.mobileNumber &&
      !VALIDATION.mobile.test(
        this.mobileNumber.trim()
      )
    ) {

      this.fieldErrors['mobileNumber'] =
        'Enter a valid 10-digit mobile number.';
    }


    // ===================================================
    // BANK NAME
    // ===================================================

    if (
      this.bankName &&
      this.bankName.trim().length > 150
    ) {

      this.fieldErrors['bankName'] =
        'Bank name is too long.';
    }


    // ===================================================
    // STOP IF VALIDATION FAILED
    // ===================================================

    if (
      Object.keys(this.fieldErrors).length > 0
    ) {

      this.errorMessage =
        'Please correct the highlighted fields.';

      return;
    }


    // ===================================================
    // PREPARE API DATA
    // ===================================================

    const beneficiaryData = {

      customerName:
        this.customerName.trim(),

      accountNumber:
        this.accountNumber.trim(),

      ifscCode:
        this.ifscCode
          .trim()
          .toUpperCase(),

      bankName:
        this.bankName.trim(),

      mobileNumber:
        this.mobileNumber.trim()

    };


    console.log(
      'Adding beneficiary:',
      beneficiaryData
    );


    // ===================================================
    // START LOADING
    // ===================================================

    this.loading = true;


    // ===================================================
    // API CALL
    // ===================================================

    this.operations
      .addBeneficiary(beneficiaryData)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (r: any) => {

          console.log(
            'Add beneficiary response:',
            r
          );


          this.loading = false;


          if (r?.success) {

            this.successMessage =
              r?.message ||
              'Beneficiary added successfully.';


            // Clear form
            this.reset(false);

          }

          else {

            this.errorMessage =
              r?.message ||
              'Unable to add beneficiary.';

          }

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (e: any) => {

          console.error(
            'Add beneficiary API error:',
            e
          );


          this.loading = false;


          // Backend validation errors
          if (
            e?.error?.fieldErrors
          ) {

            this.fieldErrors =
              e.error.fieldErrors;

          }


          this.errorMessage =
            e?.error?.message ||
            e?.error?.error ||
            'Unable to connect to backend.';

        }

      });

  }


  // =====================================================
  // RESET
  // =====================================================

  reset(
    clearMessage: boolean = true
  ): void {

    this.customerName = '';

    this.accountNumber = '';

    this.ifscCode = '';

    this.bankName = '';

    this.mobileNumber = '';

    this.fieldErrors = {};


    if (clearMessage) {

      this.errorMessage = '';

      this.successMessage = '';

    }

  }


  // =====================================================
  // ONLY NUMBERS
  // =====================================================

  onlyNumbers(
    field: 'accountNumber' | 'mobileNumber'
  ): void {

    if (
      field === 'accountNumber'
    ) {

      this.accountNumber =
        this.accountNumber
          .replace(/\D/g, '')
          .substring(0, 18);

    }


    if (
      field === 'mobileNumber'
    ) {

      this.mobileNumber =
        this.mobileNumber
          .replace(/\D/g, '')
          .substring(0, 10);

    }

  }


  // =====================================================
  // IFSC UPPERCASE
  // =====================================================

  formatIfsc(): void {

    this.ifscCode =
      this.ifscCode
        .toUpperCase()
        .replace(/\s/g, '')
        .substring(0, 11);

  }

}