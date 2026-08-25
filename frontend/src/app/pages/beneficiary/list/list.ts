import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { OperationsService } from '../../../services/operations.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {

  beneficiaries: any[] = [];

  search = '';

  loading = false;

  errorMessage = '';


  constructor(
    private operations: OperationsService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    console.log(
      '[Beneficiary List] Page opened'
    );

    this.loadBeneficiaries();

  }


  loadBeneficiaries(): void {

    console.log(
      '[Beneficiary List] Calling API'
    );


    // Clear old error
    this.errorMessage = '';

    // Start loading
    this.loading = true;


    this.operations
      .getBeneficiaries()

      .pipe(

        finalize(() => {

          // VERY IMPORTANT
          this.loading = false;

          console.log(
            '[Beneficiary List] Loading finished'
          );

          // Force Angular UI update
          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response: any) => {

          console.log(
            '[Beneficiary List] API Response:',
            response
          );


          if (
            response &&
            response.success === true
          ) {

            this.beneficiaries =
              Array.isArray(response.data)
                ? response.data
                : [];


            console.log(
              '[Beneficiary List] Records:',
              this.beneficiaries.length
            );

          }

          else {

            this.beneficiaries = [];

            this.errorMessage =
              response?.message ||
              'No beneficiaries found.';

          }


          // Force UI refresh
          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            '[Beneficiary List] API Error:',
            error
          );


          this.beneficiaries = [];


          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load beneficiaries.';


          // IMPORTANT
          this.loading = false;


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SEARCH
  // =====================================================

  get filtered(): any[] {

    const q =
      this.search
        .trim()
        .toLowerCase();


    if (!q) {

      return this.beneficiaries;

    }


    return this.beneficiaries.filter(
      (b: any) => {

        return [

          b.customer_name,
          b.account_number,
          b.ifsc_code,
          b.bank_name,
          b.mobile_number,
          b.status

        ].some(
          (value: any) =>

            String(value || '')
              .toLowerCase()
              .includes(q)

        );

      }
    );

  }


  clearSearch(): void {

    this.search = '';

  }


  refresh(): void {

    this.loadBeneficiaries();

  }

}