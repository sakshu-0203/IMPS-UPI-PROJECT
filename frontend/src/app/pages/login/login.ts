import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VALIDATION, required } from '../../utils/validation';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  organisationId = 'PROGRESSIVE-BANK';
  employeeId = '';
  password = '';
  branchCode = 'BR001';
  role = 'Maker';
  captchaText = '123456';
  captcha = '';
  showPassword = false;
  rememberOrganisation = false;
  errorMessage = '';
  loading = false;
  fieldErrors: Record<string, string> = {};

  constructor(private auth: AuthService, private router: Router) {
    const savedOrg = localStorage.getItem('rememberedOrganisation');
    if (savedOrg) {
      this.organisationId = savedOrg;
      this.rememberOrganisation = true;
    }
  }

  login(): void {
    this.errorMessage = '';
    this.fieldErrors = {};

    if (!required(this.organisationId) || !VALIDATION.organisationId.test(this.organisationId.trim())) {
      this.fieldErrors['organisationId'] = 'Enter a valid organisation ID (3–100 characters).';
    }
    if (!required(this.employeeId) || !VALIDATION.employeeId.test(this.employeeId.trim())) {
      this.fieldErrors['employeeId'] = 'Enter a valid employee ID (3–50 characters).';
    }
    if (!required(this.password) || this.password.length < 6 || this.password.length > 100) {
      this.fieldErrors['password'] = 'Password must be between 6 and 100 characters.';
    }
    if (!required(this.branchCode) || !VALIDATION.branchCode.test(this.branchCode.trim().toUpperCase())) {
      this.fieldErrors['branchCode'] = 'Enter a valid branch code.';
    }
    if (!['Maker', 'Checker', 'Admin', 'Viewer'].includes(this.role)) {
      this.fieldErrors['role'] = 'Select a valid role.';
    }
    if (!required(this.captcha) || this.captcha.trim().toUpperCase() !== this.captchaText) {
      this.fieldErrors['captcha'] = 'Captcha does not match.';
    }

    if (Object.keys(this.fieldErrors).length) {
      this.errorMessage = 'Please correct the highlighted fields.';
      return;
    }

    if (this.loading) return;
    this.loading = true;

    const loginData = {
      organisationId: this.organisationId.trim(),
      employeeId: this.employeeId.trim(),
      password: this.password,
      branchCode: this.branchCode.trim().toUpperCase(),
      role: this.role
    };

    this.auth.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response?.success) {
          if (this.rememberOrganisation) {
            localStorage.setItem('rememberedOrganisation', this.organisationId.trim());
          } else {
            localStorage.removeItem('rememberedOrganisation');
          }
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response?.message || 'Login failed.';
          this.refreshCaptcha();
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to connect to backend.';
        this.refreshCaptcha();
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  refreshCaptcha(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.captchaText = Array.from({ length: 6 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
    this.captcha = '';
  }

  forgotPassword(): void {
    alert('Please contact the administrator to reset your password.');
  }

  unlockAccount(): void {
    alert('Please contact the administrator to unlock your account.');
  }

  contactAdministrator(): void {
    alert('Please contact your system administrator.');
  }
}
