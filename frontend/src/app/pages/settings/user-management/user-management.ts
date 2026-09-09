import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OperationsService } from '../../../services/operations.service';

import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {

  // =====================================================
  // USERS
  // =====================================================

  users: any[] = [];

  loading = false;


  // =====================================================
  // FORM
  // =====================================================

  showForm = false;

  editMode = false;

  editingUserId: any = null;


  // =====================================================
  // PASSWORD
  // =====================================================

  showPassword = false;


  // =====================================================
  // MESSAGES
  // =====================================================

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // FORM DATA
  // =====================================================

  form = {

    organisationId: '',

    employeeId: '',

    employeeName: '',

    email: '',

    password: '',

    branchCode: '',

    role: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private ops: OperationsService,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUsers();

  }


  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {

    this.loading = true;

    this.errorMessage = '';

    this.ops
      .getUsers()
      .pipe(

        finalize(() => {

          this.loading = false;

          // Force Angular UI refresh
          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'GET USERS RESPONSE:',
            response
          );


          // ---------------------------------------------
          // RESPONSE ARRAY
          // ---------------------------------------------

          if (Array.isArray(response)) {

            this.users = response;

          }


          // ---------------------------------------------
          // response.data
          // ---------------------------------------------

          else if (
            Array.isArray(response?.data)
          ) {

            this.users = response.data;

          }


          // ---------------------------------------------
          // response.users
          // ---------------------------------------------

          else if (
            Array.isArray(response?.users)
          ) {

            this.users = response.users;

          }


          // ---------------------------------------------
          // EMPTY
          // ---------------------------------------------

          else {

            this.users = [];

          }


          console.log(
            'USERS ARRAY:',
            this.users
          );

          console.log(
            'USER COUNT:',
            this.users.length
          );


          // Force UI refresh
          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'GET USERS ERROR:',
            error
          );


          this.users = [];


          this.errorMessage =
            error?.error?.message ||
            'Unable to load users.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // ADD USER
  // =====================================================

  addUser(): void {

    // Show form
    this.showForm = true;

    // Add mode
    this.editMode = false;

    this.editingUserId = null;


    // Clear messages
    this.errorMessage = '';

    this.successMessage = '';


    // Reset form
    this.resetForm();


    this.cdr.detectChanges();

  }


  // =====================================================
  // EDIT USER
  // =====================================================

  editUser(user: any): void {

    console.log(
      'EDIT USER:',
      user
    );


    // Show ONLY edit form
    this.showForm = true;

    // Enable edit mode
    this.editMode = true;


    // Clear messages
    this.errorMessage = '';

    this.successMessage = '';


    // Get user ID
    this.editingUserId =
      user.id ||
      user.user_id ||
      user.employee_id;


    // Fill form
    this.form = {

      organisationId:
        user.organisation_id ||
        user.organisationId ||
        '',

      employeeId:
        user.employee_id ||
        user.employeeId ||
        '',

      employeeName:
        user.employee_name ||
        user.employeeName ||
        '',

      email:
        user.email ||
        '',

      // IMPORTANT:
      // Existing password is NEVER loaded
      password: '',

      branchCode:
        user.branch_code ||
        user.branchCode ||
        '',

      role:
        user.role ||
        ''


    };


    // Hide password initially
    this.showPassword = false;


    // Refresh UI
    this.cdr.detectChanges();

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  submit(): void {

    this.errorMessage = '';

    this.successMessage = '';


    // ===================================================
    // EMPLOYEE ID
    // ===================================================

    if (
      !this.form.employeeId.trim()
    ) {

      this.errorMessage =
        'Employee ID is required.';

      return;

    }


    // ===================================================
    // EMPLOYEE NAME
    // ===================================================

    if (
      !this.form.employeeName.trim()
    ) {

      this.errorMessage =
        'Employee Name is required.';

      return;

    }


    // ===================================================
    // EMAIL
    // ===================================================

    if (
      !this.form.email.trim()
    ) {

      this.errorMessage =
        'Email is required.';

      return;

    }


    // Correct email regex
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        this.form.email.trim()
      )
    ) {

      this.errorMessage =
        'Please enter a valid email address.';

      return;

    }


    // ===================================================
    // PASSWORD
    // ===================================================

    // Password required only for ADD
    if (
      !this.editMode &&
      !this.form.password
    ) {

      this.errorMessage =
        'Password is required.';

      return;

    }


    // Password validation
    if (
      this.form.password &&
      this.form.password.length < 6
    ) {

      this.errorMessage =
        'Password must be at least 6 characters.';

      return;

    }


    // ===================================================
    // BRANCH CODE
    // ===================================================

    if (
      !this.form.branchCode.trim()
    ) {

      this.errorMessage =
        'Branch Code is required.';

      return;

    }


    // ===================================================
    // ROLE
    // ===================================================

    const validRoles = [

      'Maker',

      'Checker',

      'Admin',

      'Viewer'

    ];


    if (
      !validRoles.includes(
        this.form.role
      )
    ) {

      this.errorMessage =
        'Please select a valid role.';

      return;

    }


    // ===================================================
    // UPDATE USER
    // ===================================================

    if (this.editMode) {

      console.log(
        'UPDATE USER REQUEST:',
        this.editingUserId,
        this.form
      );


      this.loading = true;


      this.ops
        .updateUser(
          this.editingUserId,
          this.form
        )
        .pipe(

          finalize(() => {

            this.loading = false;

            this.cdr.detectChanges();

          })

        )
        .subscribe({

          next: (response: any) => {

            console.log(
              'UPDATE USER RESPONSE:',
              response
            );


            if (
              response?.success === true
            ) {

              this.successMessage =
                response?.message ||
                'User updated successfully.';


              // Close form
              this.showForm = false;

              this.editMode = false;

              this.editingUserId = null;


              // Reset form
              this.resetForm();


              // Reload list
              this.loadUsers();

            }

            else {

              this.errorMessage =
                response?.message ||
                'Unable to update user.';

            }


            this.cdr.detectChanges();

          },


          error: (error: any) => {

            console.error(
              'UPDATE USER ERROR:',
              error
            );


            this.errorMessage =
              error?.error?.message ||
              'Unable to update user.';


            this.cdr.detectChanges();

          }

        });


      return;

    }


    // ===================================================
    // CREATE USER
    // ===================================================

    console.log(
      'CREATE USER REQUEST:',
      this.form
    );


    this.loading = true;


    this.ops
      .createUser(this.form)
      .pipe(

        finalize(() => {

          this.loading = false;

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'CREATE USER RESPONSE:',
            response
          );


          if (
            response?.success === true
          ) {

            this.successMessage =
              response?.message ||
              'User created successfully.';


            // Close form
            this.showForm = false;

            this.editMode = false;

            this.editingUserId = null;


            // Reset form
            this.resetForm();


            // Reload users
            this.loadUsers();

          }

          else {

            this.errorMessage =
              response?.message ||
              'Unable to create user.';

          }


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'CREATE USER ERROR:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to create user.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // CANCEL / CLOSE
  // =====================================================

  cancelEdit(): void {

    // Hide form
    this.showForm = false;

    // Exit edit mode
    this.editMode = false;

    this.editingUserId = null;


    // Hide password
    this.showPassword = false;


    // Clear messages
    this.errorMessage = '';

    this.successMessage = '';


    // Reset form
    this.resetForm();


    // Refresh UI
    this.cdr.detectChanges();

  }


  // =====================================================
  // SHOW / HIDE PASSWORD
  // =====================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {

    this.form = {

      organisationId:
        '',

      employeeId:
        '',

      employeeName:
        '',

      email:
        '',

      password:
        '',

      branchCode:
        '',

      role:
        ''

    };


    this.showPassword = false;

  }

}