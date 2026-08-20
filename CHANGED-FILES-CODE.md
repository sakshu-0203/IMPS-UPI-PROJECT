# Complete Changed File Code

This file contains the complete contents of every file changed for this validation pass.

## `frontend/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { NewTransfer } from './pages/transactions/new-transfer/new-transfer';
import { BulkUpload } from './pages/transactions/bulk-upload/bulk-upload';
import { Search } from './pages/transactions/search/search';
import { PendingApprovals } from './pages/approvals/pending-approval/pending-approval';
import { Inbound } from './pages/transactions/inbound/inbound';
import { Outbound } from './pages/transactions/outbound/outbound';
import { Reversal } from './pages/transactions/reversal/reversal';
import { ExceptionQueue } from './pages/transactions/exception-queue/exception-queue';
import { BalanceEnquiry } from './pages/accounts/balance-enquiry/balance-enquiry';
import { MiniStatement } from './pages/accounts/mini-statement/mini-statement';
import { AccountStatement } from './pages/accounts/account-statement/account-statement';
import { List } from './pages/beneficiary/list/list';
import { Add } from './pages/beneficiary/add/add';
import { TransactionReports } from './pages/reports/transaction-reports/transaction-reports';
import { SettlementReports } from './pages/reports/settlement-reports/settlement-reports';
import { Reconciliation } from './pages/reports/reconciliation/reconciliation';
import { ApiLogs } from './pages/monitoring/api-logs/api-logs';
import { SystemHealth } from './pages/monitoring/system-health/system-health';
import { Alerts } from './pages/monitoring/alerts/alerts';
import { UserManagement } from './pages/settings/user-management/user-management';
import { RoleManagement } from './pages/settings/role-management/role-management';
import { SystemSettings } from './pages/settings/system-settings/system-settings';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'transactions/new-transfer', component: NewTransfer },
      { path: 'transactions/bulk-upload', component: BulkUpload },
      { path: 'approvals/pending-approval', component: PendingApprovals },
      { path: 'transactions/search', component: Search },
      { path: 'transactions/inbound', component: Inbound },
      { path: 'transactions/outbound', component: Outbound },
      { path: 'transactions/reversal', component: Reversal },
      { path: 'transactions/exception-queue', component: ExceptionQueue },
      { path: 'accounts/balance-enquiry', component: BalanceEnquiry },
      { path: 'accounts/mini-statement', component: MiniStatement },
      { path: 'accounts/account-statement', component: AccountStatement },
      { path: 'beneficiary/list', component: List },
      { path: 'beneficiary/add', component: Add },
      { path: 'reports/transactions', component: TransactionReports },
      { path: 'reports/settlement', component: SettlementReports },
      { path: 'reports/reconciliation', component: Reconciliation },
      { path: 'monitoring/api-logs', component: ApiLogs },
      { path: 'monitoring/system-health', component: SystemHealth },
      { path: 'monitoring/alerts', component: Alerts },
      { path: 'settings/users', component: UserManagement },
      { path: 'settings/roles', component: RoleManagement },
      { path: 'settings/system', component: SystemSettings }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

```

## `frontend/src/app/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login']);
};

```

## `frontend/src/app/utils/validation.ts`

```typescript
export const VALIDATION = {
  organisationId: /^[A-Za-z0-9_-]{3,100}$/,
  employeeId: /^[A-Za-z0-9._-]{3,50}$/,
  branchCode: /^[A-Za-z0-9-]{2,20}$/,
  accountNumber: /^(?:\d{9,18}|X{2,}\d{4,18})$/,
  mobile: /^[6-9]\d{9}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  rrn: /^\d{6,20}$/,
  transactionId: /^[A-Za-z0-9_-]{6,50}$/,
  name: /^[A-Za-z][A-Za-z .'-]{1,99}$/,
  captcha: /^[A-Z0-9]{6}$/
} as const;

export function required(value: unknown): boolean {
  return String(value ?? '').trim().length > 0;
}

export function validAmount(value: unknown, max = 500000): boolean {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= max;
}

export function validDateRange(from: string, to: string): boolean {
  if (!from || !to) return true;
  return new Date(from).getTime() <= new Date(to).getTime();
}

```

## `frontend/src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoggedInUser {
  userId: number;
  employeeId: string;
  employeeName: string;
  organisationId: string;
  branchCode: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5000/api/auth';
  private readonly userKey = 'user';

  constructor(private http: HttpClient) {}

  login(loginData: unknown): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          localStorage.setItem(this.userKey, JSON.stringify(response.data));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('token');
    sessionStorage.clear();
  }

  getUser(): LoggedInUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoggedInUser;
    } catch {
      this.logout();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }
}

```

## `frontend/src/app/services/operations.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly apiUrl = 'http://localhost:5000/api/operations';
  constructor(private http: HttpClient) {}

  getAccounts(accountNumber = ''): Observable<any> {
    let params = new HttpParams();
    if (accountNumber) params = params.set('accountNumber', accountNumber);
    return this.http.get<any>(`${this.apiUrl}/accounts`, { params });
  }

  getAccountStatement(accountNumber: string, from = '', to = ''): Observable<any> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<any>(`${this.apiUrl}/accounts/${encodeURIComponent(accountNumber)}/statement`, { params });
  }

  getBeneficiaries(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/beneficiaries`); }
  addBeneficiary(data: any): Observable<any> { return this.http.post<any>(`${this.apiUrl}/beneficiaries`, data); }
  getTransactionReport(status = '', direction = '') { return this.http.get<any>(`${this.apiUrl}/reports/transactions`, { params: { status, direction } }); }
  getSettlementReport() { return this.http.get<any>(`${this.apiUrl}/reports/settlement`); }
  getReconciliationReport() { return this.http.get<any>(`${this.apiUrl}/reports/reconciliation`); }
  getApiLogs() { return this.http.get<any>(`${this.apiUrl}/monitoring/api-logs`); }
  getAlerts() { return this.http.get<any>(`${this.apiUrl}/monitoring/alerts`); }
  getSystemHealth() { return this.http.get<any>(`${this.apiUrl}/monitoring/system-health`); }
  getUsers() { return this.http.get<any>(`${this.apiUrl}/settings/users`); }
  createUser(data: any) { return this.http.post<any>(`${this.apiUrl}/settings/users`, data); }
  getRoles() { return this.http.get<any>(`${this.apiUrl}/settings/roles`); }
  getSystemSettings() { return this.http.get<any>(`${this.apiUrl}/settings/system`); }
  saveSystemSetting(data: any) { return this.http.put<any>(`${this.apiUrl}/settings/system`, data); }
  uploadBulkFile(data: any) { return this.http.post<any>('http://localhost:5000/api/transactions/bulk-upload', data); }
}

```

## `frontend/src/app/pages/login/login.ts`

```typescript
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

```

## `frontend/src/app/pages/login/login.html`

```html
<div class="login-page">

  <!-- ================= LEFT PANEL ================= -->

  <section class="left-panel">

    <div class="left-content">

      <!-- BRAND -->

      <div class="brand">

        <div class="brand-logo">
          <i class="bi bi-bank2"></i>
        </div>

        <div class="brand-text">

          <h1>Allianza IMPS</h1>

          <p>Operations platform for Progressive Bank</p>

        </div>

      </div>


      <!-- MAIN CONTENT -->

      <div class="left-main">

        <h2>
          Immediate Payment Service
          <br>
          operations, controlled end to end.
        </h2>

        <p class="description">

          Initiate, approve, monitor and reconcile IMPS
          activity with maker-checker discipline,
          branch-level limits and a complete audit trail.

        </p>


        <!-- FEATURES -->

        <div class="features">

          <div class="feature-item">

            <div class="feature-icon">
              <i class="bi bi-shield-check"></i>
            </div>

            <div>
              <strong>Secure Operations</strong>

              <span>
                Role-based access and controlled banking operations.
              </span>
            </div>

          </div>


          <div class="feature-item">

            <div class="feature-icon">
              <i class="bi bi-person-check"></i>
            </div>

            <div>
              <strong>Maker-Checker Workflow</strong>

              <span>
                Controlled transaction initiation and approval.
              </span>
            </div>

          </div>


          <div class="feature-item">

            <div class="feature-icon">
              <i class="bi bi-arrow-left-right"></i>
            </div>

            <div>
              <strong>Inbound & Outbound Monitoring</strong>

              <span>
                Monitor transaction movement across banking channels.
              </span>
            </div>

          </div>


          <div class="feature-item">

            <div class="feature-icon">
              <i class="bi bi-graph-up-arrow"></i>
            </div>

            <div>
              <strong>Settlement & Reconciliation</strong>

              <span>
                Track settlement activity and reconciliation status.
              </span>
            </div>

          </div>


          <div class="feature-item">

            <div class="feature-icon">
              <i class="bi bi-journal-check"></i>
            </div>

            <div>
              <strong>Complete Audit Trail</strong>

              <span>
                Maintain traceable records of operational activity.
              </span>
            </div>

          </div>

        </div>

      </div>


      <!-- LEFT FOOTER -->

      <div class="left-footer">

        <i class="bi bi-lock-fill"></i>

        <span>
          Authorized users only. All activities are monitored
          and recorded for security and audit purposes.
        </span>

      </div>

    </div>

  </section>


  <!-- ================= RIGHT PANEL ================= -->

  <section class="right-panel">

    <div class="login-container">


      <!-- TITLE -->

      <div class="login-header">

        <div>

          <h2>Operations Sign-in</h2>

          <p>
            Progressive Bank • IMPS Operations
          </p>

        </div>

     
      </div>


      <!-- LOGIN CARD -->

      <div class="login-card">

        <form (ngSubmit)="login()">


          <!-- ORGANISATION -->

          <div class="form-group">

            <label>
              Organisation ID
              <span>*</span>
            </label>

            <input
              type="text"
              name="organisationId"
              [(ngModel)]="organisationId"
              required
              maxlength="100"
              placeholder="Enter organisation ID"
            />
            @if (fieldErrors['organisationId']) { <small class="field-error">{{ fieldErrors['organisationId'] }}</small> }

          </div>


          <!-- EMPLOYEE ID -->

          <div class="form-group">

            <label>
              Employee ID or Username
              <span>*</span>
            </label>

            <input
              type="text"
              name="employeeId"
              [(ngModel)]="employeeId"
              required
              maxlength="50"
              placeholder="Enter employee ID"
            />
            @if (fieldErrors['employeeId']) { <small class="field-error">{{ fieldErrors['employeeId'] }}</small> }

          </div>


          <!-- PASSWORD -->

          <div class="form-group">

            <label>
              Password
              <span>*</span>
            </label>

            <div class="password-field">

              <input
                [type]="showPassword ? 'text' : 'password'"
                name="password"
                [(ngModel)]="password"
                required
                minlength="6"
                maxlength="100"
                placeholder="Enter password"
              />

              <button
                type="button"
                class="show-button"
                (click)="togglePassword()">

                {{ showPassword ? 'Hide' : 'Show' }}

              </button>

            </div>
            @if (fieldErrors['password']) { <small class="field-error">{{ fieldErrors['password'] }}</small> }

          </div>


          <!-- BRANCH + ROLE -->

          <div class="two-column">


            <div class="form-group">

              <label>
                Branch Code
                <span>*</span>
              </label>

              <input
                type="text"
                name="branchCode"
                [(ngModel)]="branchCode"
                required
                maxlength="20"
                placeholder="BR001"
              />
              @if (fieldErrors['branchCode']) { <small class="field-error">{{ fieldErrors['branchCode'] }}</small> }

            </div>


            <div class="form-group">

              <label>
                Role
              </label>

              <select
                name="role"
                [(ngModel)]="role">

                <option value="Maker">
                  Maker
                </option>

                <option value="Checker">
                  Checker
                </option>

                <option value="Admin">
                  Admin
                </option>

                <option value="Viewer">
                  Viewer
                </option>

              </select>

            </div>

          </div>


          <!-- CAPTCHA -->

          <div class="captcha-section">

            <div class="captcha-box">

              {{ captchaText }}

              <button
                type="button"
                class="refresh-captcha"
                (click)="refreshCaptcha()">

                <i class="bi bi-arrow-clockwise"></i>

              </button>

            </div>


            <div class="captcha-input">

              <label>
                Enter captcha
              </label>

              <input
                type="text"
                name="captcha"
                [(ngModel)]="captcha"
                required
                maxlength="6"
                placeholder="Enter captcha"
              />
              @if (fieldErrors['captcha']) { <small class="field-error">{{ fieldErrors['captcha'] }}</small> }

            </div>

          </div>


          <!-- REMEMBER -->

          <div class="remember-row">

            <label>

              <input
                type="checkbox"
                name="rememberOrganisation"
                [(ngModel)]="rememberOrganisation"
              />

              <span>
                Remember organisation
              </span>

            </label>

          </div>


          <!-- ERROR -->

          @if (errorMessage) {

            <div class="error-message">

              <i class="bi bi-exclamation-circle"></i>

              <span>
                {{ errorMessage }}
              </span>

            </div>

          }


          <!-- SIGN IN -->

          <button
            type="submit"
            class="signin-button"
            [disabled]="loading">

            <span>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </span>

            <i class="bi bi-arrow-right"></i>

          </button>


          <!-- ACTION LINKS -->

          <div class="action-links">

            <button
              type="button"
              (click)="forgotPassword()">

              Forgot password

            </button>

            <button
              type="button"
              (click)="unlockAccount()">

              Unlock account

            </button>

            <button
              type="button"
              (click)="contactAdministrator()">

              Contact administrator

            </button>

          </div>

        </form>

      </div>


      <!-- SECURITY INFORMATION -->

      <div class="security-info">

        <i class="bi bi-shield-lock"></i>

        <span>
          Secure session • Your credentials are protected
          and transmitted through the authorized banking system.
        </span>

      </div>


      <div class="last-login">

        Last successful login:
        <strong>No previous session</strong>

      </div>


    </div>

  </section>

</div>
```

## `frontend/src/app/pages/transactions/new-transfer/new-transfer.ts`

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';
import { AuthService } from '../../../services/auth.service';
import { VALIDATION, required, validAmount } from '../../../utils/validation';

@Component({
  selector: 'app-new-transfer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-transfer.html',
  styleUrl: './new-transfer.css'
})
export class NewTransfer {
  debitAccount = '';
  beneficiaryName = '';
  beneficiaryAccount = '';
  ifscCode = '';
  amount: number | null = null;
  remarks = '';
  purpose = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  fieldErrors: Record<string, string> = {};

  constructor(private transactionService: TransactionService, private auth: AuthService) {}

  submitTransfer(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    if (!required(this.debitAccount) || !VALIDATION.accountNumber.test(this.debitAccount.trim().toUpperCase())) this.fieldErrors.debitAccount = 'Select a valid debit account.';
    if (!required(this.beneficiaryName) || !VALIDATION.name.test(this.beneficiaryName.trim())) this.fieldErrors.beneficiaryName = 'Enter a valid beneficiary name.';
    if (!required(this.beneficiaryAccount) || !VALIDATION.accountNumber.test(this.beneficiaryAccount.trim().toUpperCase())) this.fieldErrors.beneficiaryAccount = 'Account number must contain 9–18 digits.';
    if (!required(this.ifscCode) || !VALIDATION.ifsc.test(this.ifscCode.trim().toUpperCase())) this.fieldErrors.ifscCode = 'Enter a valid 11-character IFSC (e.g. SBIN0001234).';
    if (!validAmount(this.amount)) this.fieldErrors.amount = 'Amount must be greater than ₹0 and not exceed ₹5,00,000.';
    if (!['Personal', 'Education', 'Medical', 'Business', 'Other'].includes(this.purpose)) this.fieldErrors.purpose = 'Select a transfer purpose.';
    if (this.remarks.length > 200) this.fieldErrors.remarks = 'Remarks cannot exceed 200 characters.';

    if (Object.keys(this.fieldErrors).length) {
      this.errorMessage = 'Please correct the highlighted fields before continuing.';
      return;
    }
    if (this.loading) return;
    this.loading = true;

    const user = this.auth.getUser();
    const transactionData = {
      transactionType: 'IMPS', direction: 'OUTBOUND',
      senderAccount: this.debitAccount.trim().toUpperCase(),
      senderName: user?.employeeName || 'Test Customer', senderMobile: '9876543210',
      beneficiaryAccount: this.beneficiaryAccount.trim().toUpperCase(),
      beneficiaryName: this.beneficiaryName.trim(), beneficiaryIfsc: this.ifscCode.trim().toUpperCase(),
      amount: Number(this.amount), purpose: this.purpose, remarks: this.remarks.trim(),
      branchCode: user?.branchCode || 'BR001', initiatedBy: user?.employeeId || 'SYSTEM'
    };

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response?.success) {
          this.successMessage = response.message || 'Transaction created successfully.';
        } else {
          this.errorMessage = response?.message || 'Transaction could not be created.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to connect to backend.';
      }
    });
  }

  resetForm(): void {
    this.debitAccount = ''; this.beneficiaryName = ''; this.beneficiaryAccount = ''; this.ifscCode = '';
    this.amount = null; this.remarks = ''; this.purpose = ''; this.errorMessage = ''; this.successMessage = ''; this.loading = false; this.fieldErrors = {};
  }
}

```

## `frontend/src/app/pages/transactions/new-transfer/new-transfer.html`

```html
<div class="transfer-page">

  <!-- PAGE HEADER -->

  <div class="page-header">

    <div>
      <h1>New IMPS Transfer</h1>

      <p>
        Initiate a new domestic instant money transfer
      </p>
    </div>

    <div class="transaction-type">
      <i class="bi bi-lightning-charge"></i>
      IMPS
    </div>

  </div>


  <!-- ERROR -->

  @if (errorMessage) {

    <div class="message error-message">
      <i class="bi bi-exclamation-circle"></i>

      <span>{{ errorMessage }}</span>
    </div>

  }


  <!-- SUCCESS -->

  @if (successMessage) {

    <div class="message success-message">
      <i class="bi bi-check-circle"></i>

      <span>{{ successMessage }}</span>
    </div>

  }


  <div class="transfer-grid">

    <!-- FORM -->

    <section class="form-card">

      <div class="card-header">

        <div>
          <h2>Transfer Details</h2>

          <p>
            Enter the beneficiary and payment information
          </p>
        </div>

      </div>


      <form (ngSubmit)="submitTransfer()">


        <!-- DEBIT ACCOUNT -->

        <div class="form-group">

          <label>
            Debit Account
            <span>*</span>
          </label>

          <select
            [(ngModel)]="debitAccount"
            name="debitAccount">

            <option value="">
              Select debit account
            </option>

            <option value="123456789012">
              XXXXXX4582 — Savings
            </option>

            <option value="123456789013">
              XXXXXX7821 — Current
            </option>

          </select>
          @if (fieldErrors['debitAccount']) { <small class="field-error">{{ fieldErrors['debitAccount'] }}</small> }

        </div>


        <!-- BENEFICIARY -->

        <div class="section-title">
          Beneficiary Information
        </div>


        <div class="form-row">

          <div class="form-group">

            <label>
              Beneficiary Name
              <span>*</span>
            </label>

            <input
              type="text"
              [(ngModel)]="beneficiaryName"
              name="beneficiaryName"
              placeholder="Enter beneficiary name"
              required
              maxlength="100"
            />
            @if (fieldErrors['beneficiaryName']) { <small class="field-error">{{ fieldErrors['beneficiaryName'] }}</small> }

          </div>


          <div class="form-group">

            <label>
              Beneficiary Account
              <span>*</span>
            </label>

            <input
              type="text"
              [(ngModel)]="beneficiaryAccount"
              name="beneficiaryAccount"
              placeholder="Enter account number"
              required
              minlength="9"
              maxlength="18"
            />
            @if (fieldErrors['beneficiaryAccount']) { <small class="field-error">{{ fieldErrors['beneficiaryAccount'] }}</small> }

          </div>

        </div>


        <div class="form-row">

          <div class="form-group">

            <label>
              IFSC Code
              <span>*</span>
            </label>

            <input
              type="text"
              [(ngModel)]="ifscCode"
              name="ifscCode"
              placeholder="Example: ABCD0123456"
              required
              minlength="11"
              maxlength="11"
            />
            @if (fieldErrors['ifscCode']) { <small class="field-error">{{ fieldErrors['ifscCode'] }}</small> }

          </div>


          <div class="form-group">

            <label>
              Transfer Purpose
              <span>*</span>
            </label>

            <select
              [(ngModel)]="purpose"
              name="purpose">

              <option value="">
                Select purpose
              </option>

              <option value="Personal">
                Personal
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Medical">
                Medical
              </option>

              <option value="Business">
                Business
              </option>

              <option value="Other">
                Other
              </option>

            </select>
            @if (fieldErrors['purpose']) { <small class="field-error">{{ fieldErrors['purpose'] }}</small> }

          </div>

        </div>


        <!-- PAYMENT -->

        <div class="section-title">
          Payment Information
        </div>


        <div class="form-row">

          <div class="form-group">

            <label>
              Transfer Amount
              <span>*</span>
            </label>

            <div class="amount-input">

              <span>₹</span>

              <input
                type="number"
                [(ngModel)]="amount"
                name="amount"
                min="1"
                placeholder="0.00"
                required
                min="1"
                max="500000"
                step="0.01"
              />
              @if (fieldErrors['amount']) { <small class="field-error">{{ fieldErrors['amount'] }}</small> }

            </div>

          </div>


          <div class="form-group">

            <label>
              Charges
            </label>

            <input
              type="text"
              value="Calculated by system"
              disabled
            />

          </div>

        </div>


        <!-- REMARKS -->

        <div class="form-group">

          <label>
            Transaction Remarks
          </label>

          <textarea
            [(ngModel)]="remarks"
            name="remarks"
            rows="3"
            maxlength="200"
            placeholder="Enter transaction remarks">
          </textarea>
          @if (fieldErrors['remarks']) { <small class="field-error">{{ fieldErrors['remarks'] }}</small> }

        </div>


        <!-- ACTIONS -->

        <div class="form-actions">

          <button
            type="button"
            class="btn-secondary"
            (click)="resetForm()">

            <i class="bi bi-arrow-counterclockwise"></i>

            Reset

          </button>


         <button
  type="submit"
  class="btn-primary"
  [disabled]="loading">

  <i
    class="bi"
    [class.bi-arrow-right-circle]="!loading"
    [class.bi-hourglass-split]="loading">
  </i>

  {{ loading ? 'Processing...' : 'Continue' }}

</button>

        </div>

      </form>

    </section>


    <!-- SUMMARY -->

    <aside class="summary-card">

      <div class="summary-header">

        <i class="bi bi-receipt"></i>

        <div>
          <h2>Transfer Summary</h2>

          <p>
            Review before submission
          </p>
        </div>

      </div>


      <div class="summary-row">

        <span>Transfer Type</span>

        <strong>IMPS</strong>

      </div>


      <div class="summary-row">

        <span>Debit Account</span>

        <strong>
          {{ debitAccount || 'Not selected' }}
        </strong>

      </div>


      <div class="summary-row">

        <span>Beneficiary</span>

        <strong>
          {{ beneficiaryName || 'Not entered' }}
        </strong>

      </div>


      <div class="summary-row">

        <span>Account Number</span>

        <strong>
          {{ beneficiaryAccount || 'Not entered' }}
        </strong>

      </div>


      <div class="summary-row">

        <span>IFSC</span>

        <strong>
          {{ ifscCode || 'Not entered' }}
        </strong>

      </div>


      <div class="summary-row">

        <span>Purpose</span>

        <strong>
          {{ purpose || 'Not selected' }}
        </strong>

      </div>


      <div class="summary-divider"></div>


      <div class="amount-summary">

        <span>Transfer Amount</span>

        <strong>
          ₹ {{ amount || '0.00' }}
        </strong>

      </div>


      <div class="security-note">

        <i class="bi bi-shield-check"></i>

        <span>
          Transaction will be processed through
          the secure banking network.
        </span>

      </div>

    </aside>

  </div>

</div>
```

## `frontend/src/app/pages/transactions/bulk-upload/bulk-upload.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../services/operations.service';
import { AuthService } from '../../../services/auth.service';
import { VALIDATION, validAmount } from '../../../utils/validation';

@Component({
  selector: 'app-bulk-upload', standalone: true, imports: [CommonModule],
  templateUrl: './bulk-upload.html', styleUrl: './bulk-upload.css'
})
export class BulkUpload {
  selectedFile: File | null = null;
  uploadStatus = '';
  totalRecords = 0; validRecords = 0; invalidRecords = 0;
  errors: Array<{ row: number; message: string }> = [];
  processing = false;

  constructor(private operations: OperationsService, private auth: AuthService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.resetResult();
    const file = input.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { this.uploadStatus = 'Please select a CSV file.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.uploadStatus = 'File size must not exceed 5 MB.'; return; }
    this.selectedFile = file;
  }

  removeFile(): void { this.selectedFile = null; this.resetResult(); }
  private resetResult(): void { this.uploadStatus = ''; this.totalRecords = 0; this.validRecords = 0; this.invalidRecords = 0; this.errors = []; }

  async validateFile(): Promise<void> {
    if (!this.selectedFile) { this.uploadStatus = 'Please select a file first.'; return; }
    if (this.processing) return;
    this.processing = true;
    try {
      const content = await this.selectedFile.text();
      this.operationsValidation(content);
    } finally { this.processing = false; }
  }

  private operationsValidation(content: string): void {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) { this.uploadStatus = 'CSV must contain a header and at least one record.'; return; }
    const headers = lines[0].split(',').map(v => v.trim().toLowerCase());
    const required = ['debit account','beneficiary name','beneficiary account','ifsc','amount','purpose','remarks'];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length) { this.uploadStatus = `Missing columns: ${missing.join(', ')}`; return; }
    const idx = Object.fromEntries(required.map(h => [h, headers.indexOf(h)]));
    this.totalRecords = lines.length - 1; this.validRecords = 0; this.invalidRecords = 0; this.errors = [];
    lines.slice(1).forEach((line, index) => {
      const row = line.split(',').map(v => v.trim()); const problems: string[] = [];
      if (!VALIDATION.accountNumber.test(row[idx['debit account']] || '')) problems.push('invalid debit account');
      if (!VALIDATION.name.test(row[idx['beneficiary name']] || '')) problems.push('invalid beneficiary name');
      if (!VALIDATION.accountNumber.test(row[idx['beneficiary account']] || '')) problems.push('invalid beneficiary account');
      if (!VALIDATION.ifsc.test((row[idx.ifsc] || '').toUpperCase())) problems.push('invalid IFSC');
      if (!validAmount(row[idx.amount])) problems.push('invalid amount');
      if (!['Personal','Education','Medical','Business','Other'].includes(row[idx.purpose])) problems.push('invalid purpose');
      if ((row[idx.remarks] || '').length > 200) problems.push('remarks too long');
      if (problems.length) { this.invalidRecords++; this.errors.push({ row: index + 2, message: problems.join(', ') }); } else this.validRecords++;
    });
    this.uploadStatus = this.invalidRecords ? `Validation completed: ${this.validRecords} valid, ${this.invalidRecords} invalid.` : 'Validation completed successfully. All records are valid.';
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) { this.uploadStatus = 'Please select a file first.'; return; }
    if (this.processing) return;
    this.processing = true;
    try {
      const content = await this.selectedFile.text();
      const user = this.auth.getUser();
      this.uploadViaTransactionService(content, user?.employeeId || 'SYSTEM');
    } catch { this.processing = false; }
  }

  private uploadViaTransactionService(content: string, uploadedBy: string): void {
    this.operations.uploadBulkFile({ fileName: this.selectedFile?.name, content, uploadedBy })?.subscribe({
      next: (response: any) => { this.processing = false; if (response?.success) { const d=response.data; this.totalRecords=d.totalRecords; this.validRecords=d.validRecords; this.invalidRecords=d.invalidRecords; this.errors=d.errors||[]; this.uploadStatus=response.message; } else this.uploadStatus=response?.message||'Upload failed.'; },
      error: (error: any) => { this.processing=false; this.uploadStatus=error?.error?.message||'Unable to upload file.'; }
    });
  }

  downloadTemplate(): void {
    const csvContent = 'Debit Account,Beneficiary Name,Beneficiary Account,IFSC,Amount,Purpose,Remarks\n123456789012,Test Beneficiary,987654321098,SBIN0001234,1000,Personal,Payment';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob); const link = document.createElement('a'); link.href=url; link.download='IMPS_Bulk_Upload_Template.csv'; link.click(); window.URL.revokeObjectURL(url);
  }
}

```

## `frontend/src/app/pages/transactions/search/search.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionService } from '../../../services/transaction.service';
import { VALIDATION } from '../../../utils/validation';


@Component({

  selector: 'app-search',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './search.html',

  styleUrl: './search.css'

})
export class Search {


  transactionId = '';

  rrn = '';

  account = '';

  mobile = '';

  status = '';


  transactions: any[] = [];


  loading = false;

  searched = false;

  errorMessage = '';


  constructor(
    private transactionService:
      TransactionService
  ) {}


  search(): void {

    this.errorMessage = '';
    const transactionId = this.transactionId.trim();
    const rrn = this.rrn.trim();
    const account = this.account.trim();
    const mobile = this.mobile.trim();
    if (!transactionId && !rrn && !account && !mobile && !this.status) {
      this.errorMessage = 'Enter at least one search criterion.';
      return;
    }
    if (transactionId && !VALIDATION.transactionId.test(transactionId)) { this.errorMessage = 'Invalid transaction ID format.'; return; }
    if (rrn && !VALIDATION.rrn.test(rrn)) { this.errorMessage = 'RRN must contain 6–20 digits.'; return; }
    if (account && !VALIDATION.accountNumber.test(account.toUpperCase())) { this.errorMessage = 'Invalid account number format.'; return; }
    if (mobile && !VALIDATION.mobile.test(mobile)) { this.errorMessage = 'Enter a valid 10-digit mobile number.'; return; }

    this.loading = true;

    this.searched = true;

    this.errorMessage = '';


    const filters = {

      transactionId:
        this.transactionId.trim(),

      rrn:
        this.rrn.trim(),

      account:
        this.account.trim(),

      mobile:
        this.mobile.trim(),

      status:
        this.status

    };


    this.transactionService
      .searchTransactions(filters)
      .subscribe({

        next: (response) => {

          this.loading = false;


          if (response.success) {

            this.transactions =
              response.data || [];

          } else {

            this.transactions = [];

            this.errorMessage =
              response.message ||
              'Search failed.';

          }

        },


        error: (error) => {

          this.loading = false;

          console.error(
            'Search error:',
            error
          );

          this.transactions = [];

          this.errorMessage =
            'Unable to connect to backend.';

        }

      });

  }


  clear(): void {

    this.transactionId = '';

    this.rrn = '';

    this.account = '';

    this.mobile = '';

    this.status = '';

    this.transactions = [];

    this.errorMessage = '';

    this.searched = false;

  }


  formatAmount(
    amount: number
  ): string {

    return Number(amount || 0)
      .toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );

  }

}
```

## `frontend/src/app/pages/transactions/inbound/inbound.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface InboundTransaction {
  transactionId: string;
  rrn: string;
  date: string;
  remitterName: string;
  remitterAccount: string;
  beneficiaryAccount: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  responseCode: string;
}

@Component({
  selector: 'app-inbound',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './inbound.html',
  styleUrl: './inbound.css'
})
export class Inbound {

  // Search box
  searchValue: string = '';

  // Status filter
  status: string = 'All';

  // Selected transaction for details panel
  selectedTransaction: InboundTransaction | null = null;


  // --------------------------------------------------
  // INBOUND TRANSACTION DATA
  // Later this data will come from Node.js API
  // --------------------------------------------------

  transactions: InboundTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void { this.loadTransactions(); }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows.filter((r: any) => ['INBOUND', 'INWARD'].includes(String(r.direction).toUpperCase())).map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, date: r.transaction_date,
          remitterName: r.sender_name || '—', remitterAccount: r.sender_account,
          beneficiaryAccount: r.beneficiary_account, amount: Number(r.amount),
          status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending',
          responseCode: r.response_code || '—'
        }));
      },
      error: (error: any) => { this.loading = false; this.errorMessage = error?.error?.message || 'Unable to load inbound transactions.'; }
    });
  }


  // --------------------------------------------------
  // FILTERED TRANSACTIONS
  // --------------------------------------------------

  get filteredTransactions(): InboundTransaction[] {

    const search =
      this.searchValue.trim().toLowerCase();

    return this.transactions.filter(
      (transaction: InboundTransaction) => {

        const matchesSearch =
          !search ||

          transaction.transactionId
            .toLowerCase()
            .includes(search) ||

          transaction.rrn
            .toLowerCase()
            .includes(search) ||

          transaction.remitterName
            .toLowerCase()
            .includes(search) ||

          transaction.remitterAccount
            .toLowerCase()
            .includes(search) ||

          transaction.beneficiaryAccount
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          this.status === 'All' ||
          transaction.status === this.status;


        return matchesSearch && matchesStatus;

      }
    );

  }


  // --------------------------------------------------
  // SUMMARY COUNTS
  // --------------------------------------------------

  get totalCount(): number {

    return this.transactions.length;

  }


  get successCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Success'
    ).length;

  }


  get pendingCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Pending'
    ).length;

  }


  get failedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Failed'
    ).length;

  }


  // --------------------------------------------------
  // VIEW TRANSACTION
  // --------------------------------------------------

  viewTransaction(
    transaction: InboundTransaction
  ): void {

    this.selectedTransaction = transaction;

  }


  // --------------------------------------------------
  // CLOSE DETAILS
  // --------------------------------------------------

  closeDetails(): void {

    this.selectedTransaction = null;

  }


  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  clearFilters(): void {

    this.searchValue = '';

    this.status = 'All';

  }

}
```

## `frontend/src/app/pages/transactions/outbound/outbound.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface OutboundTransaction {
  transactionId: string;
  rrn: string;
  date: string;
  customerName: string;
  debitAccount: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  responseCode: string;
}

@Component({
  selector: 'app-outbound',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './outbound.html',
  styleUrl: './outbound.css'
})
export class Outbound {

  searchValue = '';
  status = 'All';

  selectedTransaction: OutboundTransaction | null = null;

  transactions: OutboundTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void { this.loadTransactions(); }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows.filter((r: any) => ['OUTBOUND', 'OUTWARD'].includes(String(r.direction).toUpperCase())).map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, date: r.transaction_date, customerName: r.sender_name || '—',
          debitAccount: r.sender_account, beneficiaryName: r.beneficiary_name || '—', beneficiaryAccount: r.beneficiary_account,
          amount: Number(r.amount), status: String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Success' : String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Failed' : 'Pending', responseCode: r.response_code || '—'
        }));
      },
      error: (error: any) => { this.loading = false; this.errorMessage = error?.error?.message || 'Unable to load outbound transactions.'; }
    });
  }


  get filteredTransactions(): OutboundTransaction[] {

    const search = this.searchValue
      .trim()
      .toLowerCase();

    return this.transactions.filter(
      transaction => {

        const matchesSearch =
          !search ||

          transaction.transactionId
            .toLowerCase()
            .includes(search) ||

          transaction.rrn
            .toLowerCase()
            .includes(search) ||

          transaction.customerName
            .toLowerCase()
            .includes(search) ||

          transaction.debitAccount
            .toLowerCase()
            .includes(search) ||

          transaction.beneficiaryName
            .toLowerCase()
            .includes(search) ||

          transaction.beneficiaryAccount
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          this.status === 'All' ||
          transaction.status === this.status;

        return matchesSearch && matchesStatus;
      }
    );
  }


  get totalCount(): number {
    return this.transactions.length;
  }


  get successCount(): number {
    return this.transactions.filter(
      transaction => transaction.status === 'Success'
    ).length;
  }


  get pendingCount(): number {
    return this.transactions.filter(
      transaction => transaction.status === 'Pending'
    ).length;
  }


  get failedCount(): number {
    return this.transactions.filter(
      transaction => transaction.status === 'Failed'
    ).length;
  }


  viewTransaction(
    transaction: OutboundTransaction
  ): void {
    this.selectedTransaction = transaction;
  }


  closeDetails(): void {
    this.selectedTransaction = null;
  }


  clearFilters(): void {
    this.searchValue = '';
    this.status = 'All';
  }

}
```

## `frontend/src/app/pages/transactions/reversal/reversal.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface ReversalTransaction {
  transactionId: string;
  rrn: string;
  originalDate: string;
  customerName: string;
  accountNumber: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
}

@Component({
  selector: 'app-reversal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reversal.html',
  styleUrl: './reversal.css'
})
export class Reversal {

  searchValue = '';
  status = 'All';

  selectedTransaction: ReversalTransaction | null = null;

  transactions: ReversalTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void { this.loadTransactions(); }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows.map((r: any) => ({
          transactionId: r.transaction_id, rrn: r.rrn, originalDate: r.transaction_date,
          customerName: r.sender_name || '—', accountNumber: r.sender_account, amount: Number(r.amount),
          reason: r.response_message || 'Reversal requested by operations',
          status: String(r.transaction_status).toUpperCase() === 'FAILED' ? 'Rejected' : String(r.transaction_status).toUpperCase() === 'SUCCESS' ? 'Completed' : 'Pending'
        }));
      },
      error: (error: any) => { this.loading = false; this.errorMessage = error?.error?.message || 'Unable to load reversal records.'; }
    });
  }


  get filteredTransactions(): ReversalTransaction[] {

    const search = this.searchValue
      .trim()
      .toLowerCase();

    return this.transactions.filter(
      transaction => {

        const matchesSearch =
          !search ||

          transaction.transactionId
            .toLowerCase()
            .includes(search) ||

          transaction.rrn
            .toLowerCase()
            .includes(search) ||

          transaction.customerName
            .toLowerCase()
            .includes(search) ||

          transaction.accountNumber
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          this.status === 'All' ||
          transaction.status === this.status;


        return matchesSearch && matchesStatus;

      }
    );

  }


  get totalCount(): number {

    return this.transactions.length;

  }


  get pendingCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Pending'
    ).length;

  }


  get approvedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Approved'
    ).length;

  }


  get completedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Completed'
    ).length;

  }


  get rejectedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Rejected'
    ).length;

  }


  viewTransaction(
    transaction: ReversalTransaction
  ): void {

    this.selectedTransaction = transaction;

  }


  closeDetails(): void {

    this.selectedTransaction = null;

  }


  clearFilters(): void {

    this.searchValue = '';
    this.status = 'All';

  }


  requestReversal(
    transaction: ReversalTransaction
  ): void {

    transaction.status = 'Pending';

    alert(
      `Reversal request created for ${transaction.transactionId}`
    );

  }


  approveReversal(
    transaction: ReversalTransaction
  ): void {

    transaction.status = 'Approved';

    alert(
      `Reversal approved for ${transaction.transactionId}`
    );

  }


  rejectReversal(
    transaction: ReversalTransaction
  ): void {

    transaction.status = 'Rejected';

    alert(
      `Reversal rejected for ${transaction.transactionId}`
    );

  }

}
```

## `frontend/src/app/pages/transactions/exception-queue/exception-queue.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service';

interface ExceptionTransaction {
  transactionId: string;
  rrn: string;
  date: string;
  customerName: string;
  accountNumber: string;
  amount: number;
  exceptionType: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  responseCode: string;
}

@Component({
  selector: 'app-exception-queue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './exception-queue.html',
  styleUrl: './exception-queue.css'
})
export class ExceptionQueue {

  searchValue = '';
  status = 'All';
  priority = 'All';

  selectedException: ExceptionTransaction | null = null;


  transactions: ExceptionTransaction[] = [];
  loading = false;
  errorMessage = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void { this.loadExceptions(); }

  loadExceptions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        this.loading = false;
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.transactions = rows.filter((r: any) => String(r.transaction_status).toUpperCase() === 'FAILED').map((r: any) => ({
          transactionId:r.transaction_id, rrn:r.rrn, date:r.transaction_date, customerName:r.sender_name || '—', accountNumber:r.sender_account, amount:Number(r.amount), exceptionType:r.response_message || 'Transaction failed', priority:Number(r.amount)>=25000?'High':Number(r.amount)>=10000?'Medium':'Low', status:'Open', responseCode:r.response_code || '—'
        }));
      },
      error:(error:any)=>{this.loading=false;this.errorMessage=error?.error?.message||'Unable to load exception queue.';}
    });
  }


  get filteredTransactions(): ExceptionTransaction[] {

    const search = this.searchValue
      .trim()
      .toLowerCase();

    return this.transactions.filter(
      transaction => {

        const matchesSearch =
          !search ||

          transaction.transactionId
            .toLowerCase()
            .includes(search) ||

          transaction.rrn
            .toLowerCase()
            .includes(search) ||

          transaction.customerName
            .toLowerCase()
            .includes(search) ||

          transaction.accountNumber
            .toLowerCase()
            .includes(search) ||

          transaction.exceptionType
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          this.status === 'All' ||
          transaction.status === this.status;


        const matchesPriority =
          this.priority === 'All' ||
          transaction.priority === this.priority;


        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );

      }
    );

  }


  get totalCount(): number {

    return this.transactions.length;

  }


  get openCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Open'
    ).length;

  }


  get inProgressCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'In Progress'
    ).length;

  }


  get resolvedCount(): number {

    return this.transactions.filter(
      transaction => transaction.status === 'Resolved'
    ).length;

  }


  get highPriorityCount(): number {

    return this.transactions.filter(
      transaction => transaction.priority === 'High'
    ).length;

  }


  viewException(
    transaction: ExceptionTransaction
  ): void {

    this.selectedException = transaction;

  }


  closeDetails(): void {

    this.selectedException = null;

  }


  clearFilters(): void {

    this.searchValue = '';
    this.status = 'All';
    this.priority = 'All';

  }


  markInProgress(
    transaction: ExceptionTransaction
  ): void {

    transaction.status = 'In Progress';

  }


  resolveException(
    transaction: ExceptionTransaction
  ): void {

    transaction.status = 'Resolved';

  }

}
```

## `frontend/src/app/pages/approvals/pending-approval/pending-approval.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../services/transaction.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approval.html',
  styleUrl: './pending-approval.css'
})
export class PendingApprovals implements OnInit {
  approvals: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  actionId = '';

  constructor(private transactionService: TransactionService, private auth: AuthService) {}

  ngOnInit(): void { this.loadPendingApprovals(); }

  loadPendingApprovals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.transactionService.getPendingApprovals().subscribe({
      next: (response) => {
        this.approvals = response?.success && Array.isArray(response.data) ? response.data : [];
        if (!response?.success) this.errorMessage = response?.message || 'Unable to load pending approvals.';
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to connect to backend API.';
      }
    });
  }

  approveTransaction(approval: any): void {
    const transactionId = String(approval?.transaction_id || '');
    const user = this.auth.getUser();
    if (!transactionId || !user?.employeeId) { this.errorMessage = 'Transaction or approver information is missing.'; return; }
    if (!window.confirm(`Are you sure you want to approve transaction ${transactionId}?`)) return;
    this.actionId = transactionId;
    this.errorMessage = '';
    this.successMessage = '';
    this.transactionService.approveTransaction(transactionId, user.employeeId, '').subscribe({
      next: (response) => {
        this.actionId = '';
        if (response?.success) { this.successMessage = response.message || 'Transaction approved successfully.'; this.loadPendingApprovals(); }
        else this.errorMessage = response?.message || 'Approval failed.';
      },
      error: (error) => { this.actionId = ''; this.errorMessage = error?.error?.message || 'Approval request failed.'; }
    });
  }

  rejectTransaction(approval: any): void {
    const transactionId = String(approval?.transaction_id || '');
    const user = this.auth.getUser();
    if (!transactionId || !user?.employeeId) { this.errorMessage = 'Transaction or approver information is missing.'; return; }
    const remarks = window.prompt('Enter the rejection reason:')?.trim() || '';
    if (remarks.length < 3) { this.errorMessage = 'Rejection reason must contain at least 3 characters.'; return; }
    if (remarks.length > 255) { this.errorMessage = 'Rejection reason cannot exceed 255 characters.'; return; }
    if (!window.confirm(`Reject transaction ${transactionId}?`)) return;
    this.actionId = transactionId;
    this.errorMessage = '';
    this.successMessage = '';
    this.transactionService.rejectTransaction(transactionId, user.employeeId, remarks).subscribe({
      next: (response) => {
        this.actionId = '';
        if (response?.success) { this.successMessage = response.message || 'Transaction rejected successfully.'; this.loadPendingApprovals(); }
        else this.errorMessage = response?.message || 'Rejection failed.';
      },
      error: (error) => { this.actionId = ''; this.errorMessage = error?.error?.message || 'Rejection request failed.'; }
    });
  }

  formatAmount(amount: number): string { return Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
}

```

## `frontend/src/app/pages/accounts/balance-enquiry/balance-enquiry.ts`

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';
import { VALIDATION } from '../../../utils/validation';
@Component({selector:'app-balance-enquiry',standalone:true,imports:[FormsModule],templateUrl:'./balance-enquiry.html',styleUrl:'./balance-enquiry.css'})
export class BalanceEnquiry{accountNumber='';account:any=null;errorMessage='';loading=false;constructor(private operations:OperationsService){}search(){this.errorMessage='';this.account=null;if(!VALIDATION.accountNumber.test(this.accountNumber.trim())){this.errorMessage='Enter a valid 9–18 digit account number.';return}this.loading=true;this.operations.getAccounts(this.accountNumber.trim()).subscribe({next:r=>{this.loading=false;this.account=r?.data?.[0]||null;if(!this.account)this.errorMessage='Account not found.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load account.'}})}clear(){this.accountNumber='';this.account=null;this.errorMessage=''}}

```

## `frontend/src/app/pages/accounts/balance-enquiry/balance-enquiry.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Balance Enquiry</h1><p>Check the current available balance for an account.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="search-card"><label>Account Number *</label><div class="search-row"><input [(ngModel)]="accountNumber" maxlength="18" inputmode="numeric" placeholder="Enter account number"><button class="btn-primary" (click)="search()" [disabled]="loading">{{loading?'Checking...':'Check Balance'}}</button><button class="btn-secondary" (click)="clear()">Clear</button></div></section>@if(account){<section class="balance-card"><span>Customer</span><strong>{{account.customer_name}}</strong><span>Account Type</span><strong>{{account.account_type||'—'}}</strong><span>Available Balance</span><strong class="amount">₹ {{account.balance | number:'1.2-2'}}</strong><span>Branch</span><strong>{{account.branch_code||'—'}}</strong><span>Status</span><strong>{{account.status}}</strong></section>}</div>

```

## `frontend/src/app/pages/accounts/balance-enquiry/balance-enquiry.css`

```css
.page-shell{max-width:1000px}.search-card{padding:18px}.search-card label{display:block;font-size:12px;font-weight:600;margin-bottom:8px}.search-row{display:flex;gap:10px}.search-row input{flex:1;border:1px solid #d0d5dd;border-radius:7px;padding:10px}.balance-card{margin-top:18px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:14px}.balance-card span{color:#667085;font-size:12px}.balance-card strong{font-size:14px}.balance-card .amount{font-size:22px;color:#1677c8}@media(max-width:650px){.search-row{flex-direction:column}.balance-card{grid-template-columns:1fr}}

```

## `frontend/src/app/pages/accounts/mini-statement/mini-statement.ts`

```typescript
import { Component } from '@angular/core';import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';import { OperationsService } from '../../../services/operations.service';import { VALIDATION } from '../../../utils/validation';
@Component({selector:'app-mini-statement',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./mini-statement.html',styleUrl:'./mini-statement.css'})
export class MiniStatement{accountNumber='';rows:any[]=[];errorMessage='';loading=false;constructor(private operations:OperationsService){}search(){this.errorMessage='';this.rows=[];if(!VALIDATION.accountNumber.test(this.accountNumber.trim())){this.errorMessage='Enter a valid account number.';return}this.loading=true;this.operations.getAccountStatement(this.accountNumber.trim()).subscribe({next:r=>{this.loading=false;this.rows=r?.data?.transactions||[]},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load statement.'}})}clear(){this.accountNumber='';this.rows=[];this.errorMessage=''}}

```

## `frontend/src/app/pages/accounts/mini-statement/mini-statement.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Mini Statement</h1><p>View recent transactions for an account.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="search-card"><div class="search-row"><input [(ngModel)]="accountNumber" maxlength="18" placeholder="Account number"><button class="btn-primary" (click)="search()">Search</button><button class="btn-secondary" (click)="clear()">Clear</button></div></section><section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>RRN</th><th>Direction</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>@for(r of rows;track r.transaction_id){<tr><td>{{r.transaction_id}}</td><td>{{r.rrn}}</td><td>{{r.direction}}</td><td>₹ {{r.amount|number:'1.2-2'}}</td><td>{{r.transaction_status}}</td><td>{{r.transaction_date|date:'dd MMM yyyy, HH:mm'}}</td></tr>}@empty{<tr><td colspan="6">Search an account to view transactions.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/accounts/mini-statement/mini-statement.css`

```css
.page-shell{width:100%}.search-card,.result-card{padding:16px;margin-bottom:16px}.search-row{display:flex;gap:10px}.search-row input{flex:1;border:1px solid #d0d5dd;border-radius:7px;padding:10px}

```

## `frontend/src/app/pages/accounts/account-statement/account-statement.ts`

```typescript
import { Component } from '@angular/core';import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';import { OperationsService } from '../../../services/operations.service';import { VALIDATION, validDateRange } from '../../../utils/validation';
@Component({selector:'app-account-statement',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./account-statement.html',styleUrl:'./account-statement.css'})
export class AccountStatement{accountNumber='';fromDate='';toDate='';rows:any[]=[];errorMessage='';loading=false;constructor(private operations:OperationsService){}search(){this.errorMessage='';this.rows=[];if(!VALIDATION.accountNumber.test(this.accountNumber.trim())){this.errorMessage='Enter a valid account number.';return}if(!validDateRange(this.fromDate,this.toDate)){this.errorMessage='From date cannot be after To date.';return}this.loading=true;this.operations.getAccountStatement(this.accountNumber.trim(),this.fromDate,this.toDate).subscribe({next:r=>{this.loading=false;this.rows=r?.data?.transactions||[]},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load statement.'}})}clear(){this.accountNumber='';this.fromDate='';this.toDate='';this.rows=[];this.errorMessage=''}}

```

## `frontend/src/app/pages/accounts/account-statement/account-statement.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Account Statement</h1><p>Search account activity within a date range.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="search-card"><div class="form-row"><div class="form-group"><label>Account Number *</label><input [(ngModel)]="accountNumber" maxlength="18"></div><div class="form-group"><label>From Date</label><input type="date" [(ngModel)]="fromDate"></div><div class="form-group"><label>To Date</label><input type="date" [(ngModel)]="toDate"></div></div><div class="actions"><button class="btn-primary" (click)="search()" [disabled]="loading">{{loading?'Searching...':'Search'}}</button><button class="btn-secondary" (click)="clear()">Clear</button></div></section><section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>RRN</th><th>Sender</th><th>Beneficiary</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>@for(r of rows;track r.transaction_id){<tr><td>{{r.transaction_id}}</td><td>{{r.rrn}}</td><td>{{r.sender_account}}</td><td>{{r.beneficiary_account}}</td><td>₹ {{r.amount|number:'1.2-2'}}</td><td>{{r.transaction_status}}</td><td>{{r.transaction_date|date:'dd MMM yyyy, HH:mm'}}</td></tr>}@empty{<tr><td colspan="7">No statement records found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/accounts/account-statement/account-statement.css`

```css
.page-shell{width:100%}.search-card,.result-card{padding:16px;margin-bottom:16px}.form-row{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:12px}.form-group{display:flex;flex-direction:column;gap:6px}.form-group label{font-size:12px;font-weight:600}.form-group input{border:1px solid #d0d5dd;border-radius:7px;padding:10px}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}@media(max-width:700px){.form-row{grid-template-columns:1fr}}

```

## `frontend/src/app/pages/beneficiary/add/add.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';
import { VALIDATION, required } from '../../../utils/validation';

@Component({selector:'app-add',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./add.html',styleUrl:'./add.css'})
export class Add {
  customerName=''; accountNumber=''; ifscCode=''; bankName=''; mobileNumber=''; errorMessage=''; successMessage=''; loading=false; fieldErrors:Record<string,string>={};
  constructor(private operations:OperationsService){}
  submit():void{
    this.errorMessage='';this.successMessage='';this.fieldErrors={};
    if(!required(this.customerName)||!VALIDATION.name.test(this.customerName.trim()))this.fieldErrors.customerName='Enter a valid beneficiary name.';
    if(!required(this.accountNumber)||!VALIDATION.accountNumber.test(this.accountNumber.trim()))this.fieldErrors.accountNumber='Enter a valid account number.';
    if(!required(this.ifscCode)||!VALIDATION.ifsc.test(this.ifscCode.trim().toUpperCase()))this.fieldErrors.ifscCode='Enter a valid 11-character IFSC.';
    if(this.mobileNumber&&!VALIDATION.mobile.test(this.mobileNumber.trim()))this.fieldErrors.mobileNumber='Enter a valid 10-digit mobile number.';
    if(this.bankName.length>150)this.fieldErrors.bankName='Bank name is too long.';
    if(Object.keys(this.fieldErrors).length){this.errorMessage='Please correct the highlighted fields.';return;}
    this.loading=true;
    this.operations.addBeneficiary({customerName:this.customerName.trim(),accountNumber:this.accountNumber.trim().toUpperCase(),ifscCode:this.ifscCode.trim().toUpperCase(),bankName:this.bankName.trim(),mobileNumber:this.mobileNumber.trim()}).subscribe({next:r=>{this.loading=false;if(r?.success){this.successMessage=r.message;this.reset(false)}else this.errorMessage=r?.message||'Unable to add beneficiary.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to connect to backend.'}});
  }
  reset(clearMessage=true){this.customerName='';this.accountNumber='';this.ifscCode='';this.bankName='';this.mobileNumber='';this.fieldErrors={};if(clearMessage)this.errorMessage='';}
}

```

## `frontend/src/app/pages/beneficiary/add/add.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Add Beneficiary</h1><p>Create and validate a beneficiary before transfers.</p></div></div>
@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>} @if(successMessage){<div class="message success-message">{{successMessage}}</div>}
<section class="form-card"><div class="card-header"><h2>Beneficiary Details</h2><p>All required fields are validated before submission.</p></div>
<form (ngSubmit)="submit()"><div class="form-row"><div class="form-group"><label>Beneficiary Name *</label><input name="customerName" [(ngModel)]="customerName" maxlength="150" required><small class="field-error" *ngIf="fieldErrors.customerName">{{fieldErrors.customerName}}</small></div><div class="form-group"><label>Account Number *</label><input name="accountNumber" [(ngModel)]="accountNumber" maxlength="18" required><small class="field-error" *ngIf="fieldErrors.accountNumber">{{fieldErrors.accountNumber}}</small></div></div>
<div class="form-row"><div class="form-group"><label>IFSC Code *</label><input name="ifscCode" [(ngModel)]="ifscCode" maxlength="11" style="text-transform:uppercase" required><small class="field-error" *ngIf="fieldErrors.ifscCode">{{fieldErrors.ifscCode}}</small></div><div class="form-group"><label>Bank Name</label><input name="bankName" [(ngModel)]="bankName" maxlength="150"><small class="field-error" *ngIf="fieldErrors.bankName">{{fieldErrors.bankName}}</small></div></div>
<div class="form-row"><div class="form-group"><label>Mobile Number</label><input name="mobileNumber" [(ngModel)]="mobileNumber" maxlength="10" inputmode="numeric"><small class="field-error" *ngIf="fieldErrors.mobileNumber">{{fieldErrors.mobileNumber}}</small></div></div>
<div class="form-actions"><button type="button" class="btn-secondary" (click)="reset()">Reset</button><button type="submit" class="btn-primary" [disabled]="loading">{{loading?'Saving...':'Add Beneficiary'}}</button></div></form></section></div>

```

## `frontend/src/app/pages/beneficiary/add/add.css`

```css
.page-shell{max-width:1000px}.form-card{padding:22px}.card-header{margin-bottom:20px}.card-header h2{margin:0;font-size:17px}.card-header p{margin:5px 0;color:#667085;font-size:12px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:16px}.form-group{display:flex;flex-direction:column;gap:7px}.form-group label{font-size:12px;font-weight:600;color:#344054}.form-group input{border:1px solid #d0d5dd;border-radius:7px;padding:10px 11px}.form-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}@media(max-width:700px){.form-row{grid-template-columns:1fr}}

```

## `frontend/src/app/pages/beneficiary/list/list.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OperationsService } from '../../../services/operations.service';
@Component({selector:'app-list',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./list.html',styleUrl:'./list.css'})
export class List implements OnInit { beneficiaries:any[]=[];search='';loading=false;errorMessage='';constructor(private operations:OperationsService){} ngOnInit(){this.load()} load(){this.loading=true;this.operations.getBeneficiaries().subscribe({next:r=>{this.loading=false;this.beneficiaries=r?.success?r.data||[]:[];this.errorMessage=r?.success?'':r?.message||'Unable to load beneficiaries.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load beneficiaries.'}})} get filtered(){const q=this.search.trim().toLowerCase();return this.beneficiaries.filter(b=>!q||[b.customer_name,b.account_number,b.ifsc_code,b.bank_name].some(v=>String(v||'').toLowerCase().includes(q)))} }

```

## `frontend/src/app/pages/beneficiary/list/list.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Beneficiary List</h1><p>Search and review registered beneficiaries.</p></div><button class="btn-primary" type="button" routerLink="/beneficiary/add">Add Beneficiary</button></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="result-card"><div class="toolbar"><input [(ngModel)]="search" placeholder="Search name, account, IFSC or bank"></div>@if(loading){<div class="loading">Loading beneficiaries...</div>}@else{<div class="table-wrapper"><table><thead><tr><th>Name</th><th>Account</th><th>IFSC</th><th>Bank</th><th>Mobile</th><th>Status</th></tr></thead><tbody>@for(b of filtered; track b.id){<tr><td>{{b.customer_name}}</td><td>{{b.account_number}}</td><td>{{b.ifsc_code}}</td><td>{{b.bank_name||'—'}}</td><td>{{b.mobile_number||'—'}}</td><td>{{b.status}}</td></tr>}@empty{<tr><td colspan="6">No beneficiaries found.</td></tr>}</tbody></table></div>}</section></div>

```

## `frontend/src/app/pages/beneficiary/list/list.css`

```css
.page-shell{width:100%}.result-card{padding:16px}.toolbar{display:flex;justify-content:flex-end;margin-bottom:14px}.toolbar input{width:320px;border:1px solid #d0d5dd;border-radius:7px;padding:10px 11px}.loading{padding:30px;text-align:center;color:#667085}

```

## `frontend/src/app/pages/reports/transaction-reports/transaction-reports.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {FormsModule} from '@angular/forms';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-transaction-reports',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./transaction-reports.html',styleUrl:'./transaction-reports.css'})
export class TransactionReports implements OnInit{rows:any[]=[];status='';direction='';errorMessage='';loading=false;constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.loading=true;this.ops.getTransactionReport(this.status,this.direction).subscribe({next:r=>{this.loading=false;this.rows=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load report.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load report.'}})}clear(){this.status='';this.direction='';this.load()}}

```

## `frontend/src/app/pages/reports/transaction-reports/transaction-reports.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Transaction Reports</h1><p>Review transaction activity from the live database.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="search-card"><select [(ngModel)]="status"><option value="">All Status</option><option>PENDING</option><option>SUCCESS</option><option>FAILED</option></select><select [(ngModel)]="direction"><option value="">All Directions</option><option>INBOUND</option><option>OUTBOUND</option><option>INWARD</option><option>OUTWARD</option></select><button class="btn-primary" (click)="load()">Apply</button><button class="btn-secondary" (click)="clear()">Clear</button></section><section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Transaction</th><th>RRN</th><th>Type</th><th>Direction</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>@for(r of rows;track r.transaction_id){<tr><td>{{r.transaction_id}}</td><td>{{r.rrn}}</td><td>{{r.transaction_type}}</td><td>{{r.direction}}</td><td>₹ {{r.amount|number:'1.2-2'}}</td><td>{{r.transaction_status}}</td><td>{{r.transaction_date|date:'dd MMM yyyy, HH:mm'}}</td></tr>}@empty{<tr><td colspan="7">No records found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/reports/transaction-reports/transaction-reports.css`

```css
.page-shell{width:100%}.search-card,.result-card{padding:16px;margin-bottom:16px;display:flex;gap:10px}.search-card select{border:1px solid #d0d5dd;border-radius:7px;padding:9px}.result-card{display:block}

```

## `frontend/src/app/pages/reports/settlement-reports/settlement-reports.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-settlement-reports',standalone:true,imports:[CommonModule],templateUrl:'./settlement-reports.html',styleUrl:'./settlement-reports.css'})export class SettlementReports implements OnInit{rows:any[]=[];errorMessage='';constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getSettlementReport().subscribe({next:r=>{this.rows=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load report.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load report.'})}}

```

## `frontend/src/app/pages/reports/settlement-reports/settlement-reports.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Settlement Reports</h1><p>Daily settlement summary based on transaction status.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Date</th><th>Total</th><th>Successful</th><th>Pending</th><th>Failed</th><th>Total Amount</th></tr></thead><tbody>@for(r of rows;track r.report_date){<tr><td>{{r.report_date|date:'dd MMM yyyy'}}</td><td>{{r.total_transactions}}</td><td>{{r.successful}}</td><td>{{r.pending}}</td><td>{{r.failed}}</td><td>₹ {{r.total_amount|number:'1.2-2'}}</td></tr>}@empty{<tr><td colspan="6">No settlement data found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/reports/settlement-reports/settlement-reports.css`

```css
.page-shell{width:100%}.result-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px}

```

## `frontend/src/app/pages/reports/reconciliation/reconciliation.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-reconciliation',standalone:true,imports:[CommonModule],templateUrl:'./reconciliation.html',styleUrl:'./reconciliation.css'})export class Reconciliation implements OnInit{rows:any[]=[];errorMessage='';constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getReconciliationReport().subscribe({next:r=>{this.rows=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load reconciliation.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load reconciliation.'})}}

```

## `frontend/src/app/pages/reports/reconciliation/reconciliation.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Reconciliation</h1><p>Compare transaction counts and values by status.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Status</th><th>Transaction Count</th><th>Total Amount</th><th>Control</th></tr></thead><tbody>@for(r of rows;track r.transaction_status){<tr><td>{{r.transaction_status}}</td><td>{{r.transaction_count}}</td><td>₹ {{r.total_amount|number:'1.2-2'}}</td><td><span class="ok">Reconciled</span></td></tr>}@empty{<tr><td colspan="4">No reconciliation data found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/reports/reconciliation/reconciliation.css`

```css
.page-shell{width:100%}.result-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px}.ok{font-size:11px;font-weight:700;color:#18794e;background:#effaf3;padding:5px 8px;border-radius:20px}

```

## `frontend/src/app/pages/monitoring/api-logs/api-logs.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-api-logs',standalone:true,imports:[CommonModule],templateUrl:'./api-logs.html',styleUrl:'./api-logs.css'})export class ApiLogs implements OnInit{rows:any[]=[];errorMessage='';constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getApiLogs().subscribe({next:r=>{this.rows=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load API logs.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load API logs.'})}}

```

## `frontend/src/app/pages/monitoring/api-logs/api-logs.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>API Logs</h1><p>Recent API activity recorded by the backend.</p></div><button class="btn-primary" (click)="load()">Refresh</button></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="result-card"><div class="table-wrapper"><table><thead><tr><th>API</th><th>Method</th><th>Endpoint</th><th>Status</th><th>Execution</th><th>Created</th></tr></thead><tbody>@for(r of rows;track r.id){<tr><td>{{r.api_name}}</td><td>{{r.request_method}}</td><td>{{r.endpoint}}</td><td>{{r.status_code}}</td><td>{{r.execution_time_ms}} ms</td><td>{{r.created_at|date:'dd MMM yyyy, HH:mm:ss'}}</td></tr>}@empty{<tr><td colspan="6">No API logs found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/monitoring/api-logs/api-logs.css`

```css
.page-shell{width:100%}.result-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px}

```

## `frontend/src/app/pages/monitoring/alerts/alerts.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-alerts',standalone:true,imports:[CommonModule],templateUrl:'./alerts.html',styleUrl:'./alerts.css'})export class Alerts implements OnInit{rows:any[]=[];errorMessage='';constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getAlerts().subscribe({next:r=>{this.rows=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load alerts.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load alerts.'})}}

```

## `frontend/src/app/pages/monitoring/alerts/alerts.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Alerts</h1><p>Operational notifications and alerts.</p></div><button class="btn-primary" (click)="load()">Refresh</button></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<section class="alerts">@for(r of rows;track r.id){<article class="alert-card"><div class="icon"><i class="bi bi-bell"></i></div><div><h3>{{r.title||'Notification'}}</h3><p>{{r.message}}</p><small>{{r.created_at|date:'dd MMM yyyy, HH:mm'}}</small></div></article>}@empty{<div class="alert-card empty">No alerts found.</div>}</section></div>

```

## `frontend/src/app/pages/monitoring/alerts/alerts.css`

```css
.page-shell{width:100%}.alerts{display:grid;gap:12px}.alert-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;display:flex;gap:14px}.alert-card .icon{width:38px;height:38px;border-radius:50%;background:#eef7ff;color:#1677c8;display:flex;align-items:center;justify-content:center}.alert-card h3{margin:0 0 5px;font-size:14px}.alert-card p{margin:0 0 6px;color:#667085;font-size:12px}.alert-card small{color:#98a2b3;font-size:10px}.empty{color:#667085}

```

## `frontend/src/app/pages/monitoring/system-health/system-health.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-system-health',standalone:true,imports:[CommonModule],templateUrl:'./system-health.html',styleUrl:'./system-health.css'})export class SystemHealth implements OnInit{data:any=null;errorMessage='';loading=false;constructor(private ops:OperationsService){}ngOnInit(){this.check()}check(){this.loading=true;this.ops.getSystemHealth().subscribe({next:r=>{this.loading=false;this.data=r?.data||null;this.errorMessage=r?.success?'':r?.message||'Health check failed.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Health check failed.'}})}}

```

## `frontend/src/app/pages/monitoring/system-health/system-health.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>System Health</h1><p>Live status of the API and MySQL connection.</p></div><button class="btn-primary" (click)="check()">Refresh</button></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}@if(data){<div class="health-grid"><div class="health-card"><span>API</span><strong>{{data.api}}</strong></div><div class="health-card"><span>Database</span><strong>{{data.database}}</strong></div><div class="health-card"><span>Environment</span><strong>{{data.environment}}</strong></div><div class="health-card"><span>Checked</span><strong>{{data.timestamp|date:'dd MMM yyyy, HH:mm:ss'}}</strong></div></div>}</div>

```

## `frontend/src/app/pages/monitoring/system-health/system-health.css`

```css
.page-shell{width:100%}.health-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.health-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;display:flex;flex-direction:column;gap:8px}.health-card span{font-size:12px;color:#667085}.health-card strong{font-size:18px;color:#18794e}@media(max-width:800px){.health-grid{grid-template-columns:1fr 1fr}}@media(max-width:500px){.health-grid{grid-template-columns:1fr}}

```

## `frontend/src/app/pages/settings/user-management/user-management.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {FormsModule} from '@angular/forms';import {OperationsService} from '../../../services/operations.service';import {VALIDATION} from '../../../utils/validation';
@Component({selector:'app-user-management',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./user-management.html',styleUrl:'./user-management.css'})export class UserManagement implements OnInit{users:any[]=[];form:any={organisationId:'PROGRESSIVE-BANK',employeeId:'',employeeName:'',email:'',password:'',branchCode:'BR001',role:'Maker'};errorMessage='';successMessage='';loading=false;showForm=false;constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getUsers().subscribe({next:r=>{this.users=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load users.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load users.'})}submit(){this.errorMessage='';if(!VALIDATION.employeeId.test(this.form.employeeId)||!VALIDATION.name.test(this.form.employeeName)||String(this.form.password).length<6||!VALIDATION.branchCode.test(this.form.branchCode)||!['Maker','Checker','Admin','Viewer'].includes(this.form.role)){this.errorMessage='Please enter valid user details.';return}this.loading=true;this.ops.createUser(this.form).subscribe({next:r=>{this.loading=false;if(r?.success){this.successMessage=r.message;this.form={organisationId:'PROGRESSIVE-BANK',employeeId:'',employeeName:'',email:'',password:'',branchCode:'BR001',role:'Maker'};this.showForm=false;this.load()}else this.errorMessage=r?.message||'Unable to create user.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to create user.'}})}}

```

## `frontend/src/app/pages/settings/user-management/user-management.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>User Management</h1><p>Manage active application users.</p></div><button class="btn-primary" (click)="showForm=!showForm">{{showForm?'Close':'Add User'}}</button></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}@if(successMessage){<div class="message success-message">{{successMessage}}</div>}@if(showForm){<section class="form-card"><h2>Create User</h2><div class="form-row"><input [(ngModel)]="form.employeeId" placeholder="Employee ID"><input [(ngModel)]="form.employeeName" placeholder="Employee Name"></div><div class="form-row"><input [(ngModel)]="form.email" placeholder="Email"><input [(ngModel)]="form.password" type="password" placeholder="Temporary password"></div><div class="form-row"><input [(ngModel)]="form.branchCode" placeholder="Branch Code"><select [(ngModel)]="form.role"><option>Maker</option><option>Checker</option><option>Admin</option><option>Viewer</option></select></div><div class="actions"><button class="btn-primary" (click)="submit()" [disabled]="loading">{{loading?'Saving...':'Create User'}}</button></div></section>}<section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Employee</th><th>Name</th><th>Email</th><th>Branch</th><th>Role</th><th>Status</th></tr></thead><tbody>@for(u of users;track u.id){<tr><td>{{u.employee_id}}</td><td>{{u.employee_name}}</td><td>{{u.email||'—'}}</td><td>{{u.branch_code}}</td><td>{{u.role}}</td><td>{{u.status}}</td></tr>}@empty{<tr><td colspan="6">No users found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/settings/user-management/user-management.css`

```css
.page-shell{width:100%}.form-card,.result-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:16px}.form-card h2{margin:0 0 15px;font-size:16px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.form-row input,.form-row select{border:1px solid #d0d5dd;border-radius:7px;padding:10px}.actions{display:flex;justify-content:flex-end}@media(max-width:650px){.form-row{grid-template-columns:1fr}}

```

## `frontend/src/app/pages/settings/role-management/role-management.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-role-management',standalone:true,imports:[CommonModule],templateUrl:'./role-management.html',styleUrl:'./role-management.css'})export class RoleManagement implements OnInit{roles:any[]=[];errorMessage='';constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getRoles().subscribe({next:r=>{this.roles=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load roles.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load roles.'})}}

```

## `frontend/src/app/pages/settings/role-management/role-management.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>Role Management</h1><p>Current roles and assigned user counts.</p></div><button class="btn-primary" (click)="load()">Refresh</button></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}<div class="role-grid">@for(r of roles;track r.role){<article class="role-card"><i class="bi bi-shield-check"></i><h2>{{r.role}}</h2><p>{{r.user_count}} user(s)</p><span>Application role</span></article>}@empty{<article class="role-card"><h2>No roles</h2><p>No role data found.</p></article>}</div></div>

```

## `frontend/src/app/pages/settings/role-management/role-management.css`

```css
.page-shell{width:100%}.role-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.role-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px}.role-card i{font-size:20px;color:#1677c8}.role-card h2{margin:12px 0 4px;font-size:16px}.role-card p{margin:0;color:#344054;font-weight:600}.role-card span{display:block;margin-top:8px;color:#98a2b3;font-size:11px}@media(max-width:850px){.role-grid{grid-template-columns:1fr 1fr}}@media(max-width:500px){.role-grid{grid-template-columns:1fr}}

```

## `frontend/src/app/pages/settings/system-settings/system-settings.ts`

```typescript
import {Component,OnInit} from '@angular/core';import {CommonModule} from '@angular/common';import {FormsModule} from '@angular/forms';import {OperationsService} from '../../../services/operations.service';
@Component({selector:'app-system-settings',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./system-settings.html',styleUrl:'./system-settings.css'})export class SystemSettings implements OnInit{rows:any[]=[];configKey='';configValue='';description='';errorMessage='';successMessage='';constructor(private ops:OperationsService){}ngOnInit(){this.load()}load(){this.ops.getSystemSettings().subscribe({next:r=>{this.rows=r?.data||[];this.errorMessage=r?.success?'':r?.message||'Unable to load settings.'},error:e=>this.errorMessage=e?.error?.message||'Unable to load settings.'})}edit(r:any){this.configKey=r.config_key;this.configValue=r.config_value||'';this.description=r.description||''}save(){this.errorMessage='';this.successMessage='';if(!/^[A-Za-z0-9._-]{2,100}$/.test(this.configKey)||this.configValue.length>5000){this.errorMessage='Enter a valid configuration key and value.';return}this.ops.saveSystemSetting({configKey:this.configKey,configValue:this.configValue,description:this.description}).subscribe({next:r=>{if(r?.success){this.successMessage=r.message;this.load()}else this.errorMessage=r?.message||'Unable to save setting.'},error:e=>this.errorMessage=e?.error?.message||'Unable to save setting.'})}}

```

## `frontend/src/app/pages/settings/system-settings/system-settings.html`

```html
<div class="page-shell"><div class="page-header"><div><h1>System Settings</h1><p>View and safely update application configuration.</p></div></div>@if(errorMessage){<div class="message error-message">{{errorMessage}}</div>}@if(successMessage){<div class="message success-message">{{successMessage}}</div>}<section class="form-card"><div class="form-row"><input [(ngModel)]="configKey" placeholder="Configuration key"><input [(ngModel)]="configValue" placeholder="Configuration value"></div><textarea [(ngModel)]="description" maxlength="255" placeholder="Description"></textarea><div class="actions"><button class="btn-primary" (click)="save()">Save Setting</button></div></section><section class="result-card"><div class="table-wrapper"><table><thead><tr><th>Key</th><th>Value</th><th>Description</th><th>Updated</th><th></th></tr></thead><tbody>@for(r of rows;track r.id){<tr><td>{{r.config_key}}</td><td>{{r.config_value}}</td><td>{{r.description||'—'}}</td><td>{{r.updated_at|date:'dd MMM yyyy, HH:mm'}}</td><td><button class="btn-secondary" (click)="edit(r)">Edit</button></td></tr>}@empty{<tr><td colspan="5">No settings found.</td></tr>}</tbody></table></div></section></div>

```

## `frontend/src/app/pages/settings/system-settings/system-settings.css`

```css
.page-shell{width:100%}.form-card,.result-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:16px}.form-row{display:grid;grid-template-columns:1fr 2fr;gap:12px}.form-row input,.form-card textarea{width:100%;border:1px solid #d0d5dd;border-radius:7px;padding:10px}.form-card textarea{margin-top:12px;min-height:90px;resize:vertical}.actions{display:flex;justify-content:flex-end;margin-top:12px}@media(max-width:650px){.form-row{grid-template-columns:1fr}}

```

## `frontend/src/app/layout/header/header.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoggedInUser } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  showUserMenu = false;
  showLogoutModal = false;
  user: LoggedInUser | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.user = this.auth.getUser();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  openLogoutConfirmation(): void {
    this.showUserMenu = false;
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.auth.logout();
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }
}

```

## `frontend/src/app/layout/header/header.html`

```html
<header class="top-header">
  <div class="header-left">
    <div class="header-brand">
      <span class="brand-name">Allianza</span>
      <span class="brand-module">IMPS Operations</span>
    </div>
  </div>

  <div class="header-search">
    <i class="bi bi-search"></i>
    <input type="text" placeholder="Search Transaction ID, RRN, Mobile" aria-label="Global transaction search" />
  </div>

  <div class="header-right">
    <div class="system-status"><span class="status-dot"></span><span>System Operational</span></div>
    <div class="header-divider"></div>

    <div class="user-menu-wrapper">
      <button type="button" class="user-section" (click)="toggleUserMenu()" aria-haspopup="menu" [attr.aria-expanded]="showUserMenu">
        <div class="user-avatar">{{ (user?.employeeName || 'A').charAt(0).toUpperCase() }}</div>
        <div class="user-details">
          <strong>{{ user?.employeeName || 'Admin' }}</strong>
          <span>{{ user?.role || 'Operations' }}</span>
        </div>
        <i class="bi bi-chevron-down"></i>
      </button>

      @if (showUserMenu) {
        <div class="user-dropdown" role="menu">
          <div class="user-dropdown-info">
            <strong>{{ user?.employeeName || 'Admin' }}</strong>
            <span>{{ user?.employeeId || '' }} · {{ user?.role || 'Operations' }}</span>
          </div>
          <button type="button" class="logout-menu-button" (click)="openLogoutConfirmation()">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      }
    </div>
  </div>

  @if (showLogoutModal) {
    <div class="logout-overlay" role="presentation" (click)="cancelLogout()">
      <div class="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title" (click)="$event.stopPropagation()">
        <div class="logout-icon"><i class="bi bi-box-arrow-right"></i></div>
        <h3 id="logout-title">Are you sure you want to logout?</h3>
        <p>Your current session will be cleared and you will be redirected to the Login page.</p>
        <div class="logout-actions">
          <button type="button" class="cancel-button" (click)="cancelLogout()">Cancel</button>
          <button type="button" class="confirm-logout-button" (click)="confirmLogout()">Logout</button>
        </div>
      </div>
    </div>
  }
</header>

```

## `frontend/src/app/layout/header/header.css`

```css
.top-header {
  height: 70px;

  background: #ffffff;

  border-bottom: 1px solid #e5e9f0;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 0 28px;

  box-sizing: border-box;

  position: sticky;

  top: 0;

  z-index: 900;
}


/* LEFT */

.header-left {
  min-width: 210px;
}

.header-brand {
  display: flex;

  align-items: baseline;

  gap: 8px;
}

.brand-name {
  color: #172b4d;

  font-size: 19px;

  font-weight: 700;
}

.brand-module {
  color: #718096;

  font-size: 12px;
}


/* SEARCH */

.header-search {
  width: 360px;

  height: 38px;

  display: flex;

  align-items: center;

  gap: 9px;

  background: #f6f8fb;

  border: 1px solid #e1e7ef;

  border-radius: 7px;

  padding: 0 12px;

  box-sizing: border-box;
}

.header-search i {
  color: #8291a5;

  font-size: 14px;
}

.header-search input {
  width: 100%;

  border: none;

  outline: none;

  background: transparent;

  color: #334155;

  font-size: 12px;
}

.header-search input::placeholder {
  color: #94a3b8;
}


/* RIGHT */

.header-right {
  display: flex;

  align-items: center;

  gap: 18px;

  min-width: 250px;

  justify-content: flex-end;
}

.system-status {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #198754;

  font-size: 12px;

  font-weight: 600;
}

.status-dot {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #198754;
}

.header-divider {
  height: 28px;

  width: 1px;

  background: #e2e8f0;
}

.user-section {
  display: flex;

  align-items: center;

  gap: 9px;

  cursor: pointer;
}

.user-avatar {
  width: 34px;

  height: 34px;

  border-radius: 50%;

  background: #e8f1fa;

  color: #1769aa;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 13px;

  font-weight: 700;
}

.user-details {
  display: flex;

  flex-direction: column;

  gap: 2px;
}

.user-details strong {
  color: #334155;

  font-size: 12px;
}

.user-details span {
  color: #94a3b8;

  font-size: 10px;
}

.user-section > i {
  color: #64748b;

  font-size: 11px;
}


/* RESPONSIVE */

@media (max-width: 1000px) {

  .header-search {
    width: 260px;
  }

  .system-status {
    display: none;
  }

}

@media (max-width: 700px) {

  .header-left {
    min-width: auto;
  }

  .brand-module {
    display: none;
  }

  .header-search {
    display: none;
  }

}

.user-menu-wrapper { position: relative; }
.user-section { border: 0; background: transparent; padding: 4px; }
.user-section:hover { background: #f7f9fc; border-radius: 8px; }
.user-dropdown { position: absolute; right: 0; top: calc(100% + 10px); width: 230px; background: #fff; border: 1px solid #e3e8ef; border-radius: 10px; box-shadow: 0 14px 35px rgba(15, 23, 42, .14); padding: 10px; z-index: 1100; }
.user-dropdown-info { padding: 8px 10px 10px; border-bottom: 1px solid #eef2f6; display: flex; flex-direction: column; gap: 3px; }
.user-dropdown-info strong { font-size: 13px; color: #1e293b; }
.user-dropdown-info span { font-size: 11px; color: #64748b; }
.logout-menu-button { width: 100%; border: 0; background: transparent; color: #b42318; text-align: left; padding: 10px; margin-top: 4px; border-radius: 7px; cursor: pointer; font-size: 12px; }
.logout-menu-button:hover { background: #fff1f0; }
.logout-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, .42); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.logout-modal { width: min(420px, 100%); background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 24px 70px rgba(15, 23, 42, .25); text-align: center; }
.logout-icon { width: 48px; height: 48px; border-radius: 50%; margin: 0 auto 14px; background: #fff4e5; color: #b54708; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.logout-modal h3 { margin: 0 0 8px; color: #172b4d; font-size: 18px; }
.logout-modal p { margin: 0; color: #64748b; font-size: 13px; line-height: 1.6; }
.logout-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.cancel-button, .confirm-logout-button { min-width: 95px; border-radius: 7px; padding: 10px 16px; font-weight: 600; cursor: pointer; }
.cancel-button { border: 1px solid #d5dce5; background: #fff; color: #334155; }
.confirm-logout-button { border: 1px solid #b42318; background: #b42318; color: #fff; }

```

## `frontend/src/app/layout/sidebar/sidebar.html`

```html
<aside class="sidebar">

  <!-- BRAND -->

  <div class="sidebar-brand">

    <div class="brand-logo">
      A
    </div>

    <div class="brand-text">
      <strong>Allianza</strong>
      <span>IMPS Operations</span>
    </div>

  </div>


  <!-- MENU -->

  <nav class="sidebar-menu">

    <!-- DASHBOARD -->

    <a
      routerLink="/dashboard"
      routerLinkActive="active"
      [routerLinkActiveOptions]="{ exact: true }"
      class="menu-item">

      <i class="bi bi-speedometer2"></i>

      <span>Dashboard</span>

    </a>


    <!-- IMPS OPERATIONS -->

    <div class="menu-title">
      IMPS OPERATIONS
    </div>


    <a
      routerLink="/transactions/new-transfer"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-arrow-left-right"></i>

      <span>New Transfer</span>

    </a>


    <a
      routerLink="/transactions/bulk-upload"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-upload"></i>

      <span>Bulk Upload</span>

    </a>


   <a
  routerLink="/approvals/pending-approval"
  routerLinkActive="active"
  class="menu-item">

  <i class="bi bi-clock-history"></i>

  <span>Pending Approval</span>

</a>

    <a
      routerLink="/transactions/search"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-search"></i>

      <span>Transaction Search</span>

    </a>


    <a
      routerLink="/transactions/inbound"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-arrow-down-circle"></i>

      <span>Inbound</span>

    </a>


    <a
      routerLink="/transactions/outbound"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-arrow-up-circle"></i>

      <span>Outbound</span>

    </a>


    <a
      routerLink="/transactions/reversal"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-arrow-repeat"></i>

      <span>Reversal</span>

    </a>


    <a
      routerLink="/transactions/exception-queue"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-exclamation-circle"></i>

      <span>Exception Queue</span>

    </a>


    <!-- ACCOUNTS -->

    <div class="menu-title">
      ACCOUNTS
    </div>


    <a
      routerLink="/accounts/balance-enquiry"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-wallet2"></i>

      <span>Balance Enquiry</span>

    </a>


    <a
      routerLink="/accounts/mini-statement"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-file-earmark-text"></i>

      <span>Mini Statement</span>

    </a>


    <a
      routerLink="/accounts/account-statement"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-journal-text"></i>

      <span>Account Statement</span>

    </a>


    <!-- BENEFICIARY -->

    <div class="menu-title">
      BENEFICIARY
    </div>


    <a
      routerLink="/beneficiary/list"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-people"></i>

      <span>Beneficiary List</span>

    </a>


    <a
      routerLink="/beneficiary/add"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-person-plus"></i>

      <span>Add Beneficiary</span>

    </a>


    <!-- REPORTS -->

    <div class="menu-title">
      REPORTS
    </div>


    <a
      routerLink="/reports/transactions"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-bar-chart"></i>

      <span>Transaction Reports</span>

    </a>


    <a
      routerLink="/reports/settlement"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-bank"></i>

      <span>Settlement Reports</span>

    </a>


    <a
      routerLink="/reports/reconciliation"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-arrow-repeat"></i>

      <span>Reconciliation</span>

    </a>

    <!-- MONITORING -->

    <div class="menu-title">
      MONITORING
    </div>


    <a
      routerLink="/monitoring/api-logs"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-terminal"></i>

      <span>API Logs</span>

    </a>


    <a
      routerLink="/monitoring/system-health"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-heart-pulse"></i>

      <span>System Health</span>

    </a>


    <a
      routerLink="/monitoring/alerts"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-bell"></i>

      <span>Alerts</span>

    </a>


    <!-- SETTINGS -->

    <div class="menu-title">
      SETTINGS
    </div>


    <a
      routerLink="/settings/users"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-person-gear"></i>

      <span>User Management</span>

    </a>


    <a
      routerLink="/settings/roles"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-shield-check"></i>

      <span>Role Management</span>

    </a>


    <a
      routerLink="/settings/system"
      routerLinkActive="active"
      class="menu-item">

      <i class="bi bi-gear"></i>

      <span>System Settings</span>

    </a>

  </nav>


  <!-- SIDEBAR BOTTOM -->

  <div class="sidebar-bottom">

    <div class="connection-status">

      <span class="connection-dot"></span>

      <div>
        <strong>Connected</strong>
        <small>Banking Network</small>
      </div>

    </div>

  </div>

</aside>
```

## `frontend/src/styles.css`

```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; font-family: Inter, "Segoe UI", Arial, sans-serif; background: #f5f7fb; color: #172b4d; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button:disabled { opacity: .6; cursor: not-allowed !important; }
input, select, textarea { transition: border-color .15s ease, box-shadow .15s ease; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #1677c8 !important; box-shadow: 0 0 0 3px rgba(22,119,200,.10); }
.field-error { display: block; margin-top: 5px; color: #b42318; font-size: 11px; line-height: 1.35; }
input.ng-invalid.ng-touched, select.ng-invalid.ng-touched, textarea.ng-invalid.ng-touched { border-color: #d92d20; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; margin-bottom:20px; }
.page-header h1 { margin:0; font-size:24px; color:#172b4d; }
.page-header p { margin:6px 0 0; color:#718096; font-size:13px; }
.card, .form-card, .search-card, .result-card, .upload-card, .info-card, .validation-card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; box-shadow:0 2px 8px rgba(15,23,42,.03); }
.message, .error, .status-message { border-radius:8px; padding:11px 13px; margin-bottom:16px; font-size:13px; }
.error, .error-message { background:#fff4f2; color:#b42318; border:1px solid #fecdca; }
.success-message { background:#effaf3; color:#18794e; border:1px solid #b7e4c7; }
.status-message { background:#eef7ff; color:#175cd3; border:1px solid #b2ddff; }
.table-wrapper { overflow:auto; border:1px solid #e7ebf0; border-radius:8px; }
table { width:100%; border-collapse:collapse; min-width:720px; }
th { background:#f8fafc; color:#475467; font-size:11px; text-transform:uppercase; letter-spacing:.03em; text-align:left; padding:11px 12px; border-bottom:1px solid #e4e7ec; }
td { padding:12px; border-bottom:1px solid #eef1f4; color:#344054; font-size:12px; vertical-align:middle; }
tr:last-child td { border-bottom:0; }
.btn-primary, .search-btn, .upload-btn { border:1px solid #1677c8; background:#1677c8; color:#fff; border-radius:7px; padding:9px 14px; cursor:pointer; font-weight:600; }
.btn-secondary, .clear-btn, .template-btn { border:1px solid #d0d5dd; background:#fff; color:#344054; border-radius:7px; padding:9px 14px; cursor:pointer; font-weight:600; }
@media (max-width: 900px) { body { overflow:auto; } .page-header { flex-direction:column; } }
@media (max-width: 640px) { .page-content { padding:14px !important; } .form-row, .two-column, .bulk-grid, .transfer-grid { grid-template-columns:1fr !important; } table { min-width:620px; } }

```

## `backend/src/server.js`

```javascript
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDatabase } = require('./config/database');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const operationsRoutes = require('./routes/operationsRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true);
    }

    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  console.log(`${req.method} ${req.originalUrl}`);
  res.on('finish', async () => {
    try {
      const { pool } = require('./config/database');
      await pool.query(
        `INSERT INTO api_logs (api_name, request_method, endpoint, request_body, response_body, status_code, execution_time_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.originalUrl.split('?')[0],
          req.method,
          req.originalUrl,
          req.method === 'GET' ? null : JSON.stringify(req.body || {}),
          null,
          res.statusCode,
          Date.now() - startedAt
        ]
      );
    } catch (logError) {
      console.error('API log write failed:', logError.message);
    }
  });
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IMPS-UPI Backend is running',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/operations', operationsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Backend error:', error);

  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error.'
  });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log('====================================');
      console.log('IMPS-UPI BACKEND SERVER');
      console.log('====================================');
      console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`Port        : ${PORT}`);
      console.log(`API         : http://localhost:${PORT}`);
      console.log(`Health      : http://localhost:${PORT}/api/health`);
      console.log(`Dashboard   : http://localhost:${PORT}/api/dashboard/summary`);
      console.log('====================================');
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

startServer();

```

## `backend/src/controllers/authController.js`

```javascript
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { patterns, clean, required } = require('../utils/validation');

const ALLOWED_ROLES = new Set(['Maker', 'Checker', 'Admin', 'Viewer']);

const login = async (req, res) => {
  try {
    const organisationId = clean(req.body.organisationId);
    const employeeId = clean(req.body.employeeId);
    const password = String(req.body.password ?? '');
    const branchCode = clean(req.body.branchCode).toUpperCase();
    const role = clean(req.body.role);

    if (!required(organisationId) || !patterns.organisationId.test(organisationId)) {
      return res.status(400).json({ success: false, message: 'Enter a valid organisation ID.' });
    }
    if (!required(employeeId) || !patterns.employeeId.test(employeeId)) {
      return res.status(400).json({ success: false, message: 'Enter a valid employee ID.' });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ success: false, message: 'Password must be between 6 and 100 characters.' });
    }
    if (!patterns.branchCode.test(branchCode)) {
      return res.status(400).json({ success: false, message: 'Enter a valid branch code.' });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role.' });
    }

    const [rows] = await pool.query(
      `SELECT id, organisation_id, employee_id, employee_name, email, password, branch_code, role, status
       FROM users
       WHERE organisation_id = ? AND employee_id = ? AND branch_code = ? AND role = ?
       LIMIT 1`,
      [organisationId, employeeId, branchCode, role]
    );

    if (!rows.length) {
      await pool.query(`INSERT INTO login_logs (employee_id, status, failure_reason) VALUES (?, 'FAILED', ?)`, [employeeId, 'Invalid login details']).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid login details.' });
    }

    const user = rows[0];
    if (String(user.status).toUpperCase() !== 'ACTIVE') {
      await pool.query(`INSERT INTO login_logs (employee_id, status, failure_reason) VALUES (?, 'FAILED', ?)`, [employeeId, 'Inactive account']).catch(() => {});
      return res.status(403).json({ success: false, message: 'User account is not active.' });
    }

    let passwordValid = false;
    if (String(user.password).startsWith('$2a$') || String(user.password).startsWith('$2b$') || String(user.password).startsWith('$2y$')) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      passwordValid = password === user.password;
    }

    if (!passwordValid) {
      await pool.query(`INSERT INTO login_logs (employee_id, status, failure_reason) VALUES (?, 'FAILED', ?)`, [employeeId, 'Invalid password']).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid login details.' });
    }

    await pool.query(`INSERT INTO login_logs (employee_id, status) VALUES (?, 'SUCCESS')`, [employeeId]).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        employeeId: user.employee_id,
        employeeName: user.employee_name,
        organisationId: user.organisation_id,
        branchCode: user.branch_code,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { login };

```

## `backend/src/controllers/transactionController.js`

```javascript
const { pool } = require('../config/database');
const { patterns, clean, required, validAmount } = require('../utils/validation');

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM transactions ORDER BY transaction_date DESC, id DESC`);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transactionId = clean(req.params.transactionId);
    if (!patterns.transactionId.test(transactionId)) return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    const [rows] = await pool.query(`SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1`, [transactionId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction.' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transactionType = clean(req.body.transactionType).toUpperCase();
    const direction = clean(req.body.direction).toUpperCase();
    const senderAccount = clean(req.body.senderAccount).toUpperCase();
    const senderName = clean(req.body.senderName);
    const senderMobile = clean(req.body.senderMobile);
    const beneficiaryAccount = clean(req.body.beneficiaryAccount).toUpperCase();
    const beneficiaryName = clean(req.body.beneficiaryName);
    const beneficiaryIfsc = clean(req.body.beneficiaryIfsc).toUpperCase();
    const amount = Number(req.body.amount);
    const purpose = clean(req.body.purpose);
    const remarks = clean(req.body.remarks);
    const branchCode = clean(req.body.branchCode).toUpperCase();
    const initiatedBy = clean(req.body.initiatedBy);

    if (transactionType !== 'IMPS') throw validationError('Transaction type must be IMPS.');
    if (!['OUTBOUND', 'INBOUND'].includes(direction)) throw validationError('Invalid transaction direction.');
    if (!patterns.account.test(senderAccount)) throw validationError('Enter a valid sender account number.');
    if (senderName && !patterns.name.test(senderName)) throw validationError('Enter a valid sender name.');
    if (!patterns.mobile.test(senderMobile)) throw validationError('Enter a valid 10-digit sender mobile number.');
    if (!patterns.account.test(beneficiaryAccount)) throw validationError('Enter a valid beneficiary account number.');
    if (!patterns.name.test(beneficiaryName)) throw validationError('Enter a valid beneficiary name.');
    if (!patterns.ifsc.test(beneficiaryIfsc)) throw validationError('Enter a valid 11-character IFSC code.');
    if (!validAmount(amount)) throw validationError('Amount must be greater than zero and not exceed ₹5,00,000.');
    if (!['Personal', 'Education', 'Medical', 'Business', 'Other'].includes(purpose)) throw validationError('Select a valid transaction purpose.');
    if (remarks.length > 200) throw validationError('Remarks cannot exceed 200 characters.');
    if (branchCode && !patterns.branchCode.test(branchCode)) throw validationError('Invalid branch code.');

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const rrn = `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-12);

    const [result] = await pool.query(
      `INSERT INTO transactions
       (transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
        beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status,
        branch_code, initiated_by, response_message, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, NOW())`,
      [transactionId, rrn, transactionType, direction, senderAccount, senderName || null, senderMobile,
       beneficiaryAccount, beneficiaryName, beneficiaryIfsc, amount, branchCode || null,
       initiatedBy || null, remarks || 'Transaction created and awaiting approval']
    );

    await pool.query(
      `INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks)
       VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`,
      [transactionId, initiatedBy || 'SYSTEM', remarks || 'Transaction requires maker-checker approval']
    );

    res.status(201).json({ success: true, message: 'Transaction created and sent for approval.', data: { id: result.insertId, transactionId, rrn, status: 'PENDING' } });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to create transaction.' });
  }
};

const searchTransactions = async (req, res) => {
  try {
    const transactionId = clean(req.query.transactionId);
    const rrn = clean(req.query.rrn);
    const account = clean(req.query.account);
    const mobile = clean(req.query.mobile);
    const status = clean(req.query.status).toUpperCase();

    if (!transactionId && !rrn && !account && !mobile && !status) {
      return res.status(400).json({ success: false, message: 'Enter at least one search criterion.' });
    }
    if (transactionId && !patterns.transactionId.test(transactionId)) return res.status(400).json({ success: false, message: 'Invalid transaction ID format.' });
    if (rrn && !patterns.rrn.test(rrn)) return res.status(400).json({ success: false, message: 'RRN must contain 6–20 digits.' });
    if (account && !patterns.account.test(account)) return res.status(400).json({ success: false, message: 'Invalid account number format.' });
    if (mobile && !patterns.mobile.test(mobile)) return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    if (status && !['PENDING', 'SUCCESS', 'FAILED'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid transaction status.' });

    let query = `SELECT * FROM transactions WHERE 1=1`;
    const params = [];
    if (transactionId) { query += ` AND transaction_id LIKE ?`; params.push(`%${transactionId}%`); }
    if (rrn) { query += ` AND rrn LIKE ?`; params.push(`%${rrn}%`); }
    if (account) { query += ` AND (sender_account LIKE ? OR beneficiary_account LIKE ?)`; params.push(`%${account}%`, `%${account}%`); }
    if (mobile) { query += ` AND sender_mobile LIKE ?`; params.push(`%${mobile}%`); }
    if (status) { query += ` AND transaction_status = ?`; params.push(status); }
    query += ` ORDER BY transaction_date DESC, id DESC LIMIT 200`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Search transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to search transactions.' });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pa.id, pa.transaction_id, pa.requested_by, pa.requested_at, pa.approved_by, pa.approved_at,
             pa.status, pa.remarks, t.rrn, t.transaction_type, t.direction, t.sender_account, t.sender_name,
             t.sender_mobile, t.beneficiary_account, t.beneficiary_name, t.beneficiary_ifsc, t.amount,
             t.transaction_status, t.branch_code, t.initiated_by, t.transaction_date
      FROM pending_approvals pa
      INNER JOIN transactions t ON pa.transaction_id = t.transaction_id
      WHERE UPPER(pa.status) = 'PENDING'
      ORDER BY pa.requested_at DESC, pa.id DESC`);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending approvals.' });
  }
};

const sendForApproval = async (req, res) => {
  try {
    const transactionId = clean(req.body.transactionId);
    const requestedBy = clean(req.body.requestedBy);
    const remarks = clean(req.body.remarks);
    if (!patterns.transactionId.test(transactionId) || !patterns.employeeId.test(requestedBy)) return res.status(400).json({ success: false, message: 'Valid transaction ID and requester ID are required.' });
    if (remarks.length > 255) return res.status(400).json({ success: false, message: 'Remarks cannot exceed 255 characters.' });

    const [transactions] = await pool.query(`SELECT transaction_id, transaction_status FROM transactions WHERE transaction_id = ? LIMIT 1`, [transactionId]);
    if (!transactions.length) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (transactions[0].transaction_status !== 'PENDING') return res.status(400).json({ success: false, message: `Transaction is ${transactions[0].transaction_status}.` });

    const [existing] = await pool.query(`SELECT id FROM pending_approvals WHERE transaction_id = ? AND status = 'PENDING' LIMIT 1`, [transactionId]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Transaction is already awaiting approval.' });

    await pool.query(`INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks) VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`, [transactionId, requestedBy, remarks || null]);
    res.status(201).json({ success: true, message: 'Transaction sent for approval successfully.', data: { transactionId, status: 'PENDING' } });
  } catch (error) {
    console.error('Send for approval error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

async function updateApproval(req, res, approved) {
  const connection = await pool.getConnection();
  try {
    const transactionId = clean(req.body.transactionId);
    const approvedBy = clean(req.body.approvedBy);
    const remarks = clean(req.body.remarks);
    if (!patterns.transactionId.test(transactionId) || !patterns.employeeId.test(approvedBy)) return res.status(400).json({ success: false, message: 'Valid transaction ID and approver ID are required.' });
    const [approverRows] = await connection.query(`SELECT role, status FROM users WHERE employee_id = ? LIMIT 1`, [approvedBy]);
    if (!approverRows.length || String(approverRows[0].status).toUpperCase() !== 'ACTIVE') return res.status(403).json({ success: false, message: 'Approver account is not active.' });
    if (!['Checker', 'Admin'].includes(approverRows[0].role)) return res.status(403).json({ success: false, message: 'Only Checker or Admin users can approve or reject transactions.' });
    if (!approved && remarks.length < 3) return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    if (remarks.length > 255) return res.status(400).json({ success: false, message: 'Remarks cannot exceed 255 characters.' });

    await connection.beginTransaction();
    const [approvals] = await connection.query(`SELECT id FROM pending_approvals WHERE transaction_id = ? AND status = 'PENDING' LIMIT 1 FOR UPDATE`, [transactionId]);
    if (!approvals.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Pending approval not found.' });
    }

    const newTransactionStatus = approved ? 'SUCCESS' : 'FAILED';
    const responseCode = approved ? '00' : 'RJ';
    const responseMessage = approved ? 'Transaction approved' : remarks;
    await connection.query(`UPDATE transactions SET transaction_status = ?, approved_by = ?, response_code = ?, response_message = ? WHERE transaction_id = ?`, [newTransactionStatus, approvedBy, responseCode, responseMessage, transactionId]);
    await connection.query(`UPDATE pending_approvals SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, remarks = ? WHERE transaction_id = ? AND status = 'PENDING'`, [approved ? 'APPROVED' : 'REJECTED', approvedBy, remarks || null, transactionId]);
    await connection.commit();
    res.json({ success: true, message: approved ? 'Transaction approved successfully.' : 'Transaction rejected successfully.', data: { transactionId, status: approved ? 'APPROVED' : 'REJECTED' } });
  } catch (error) {
    await connection.rollback();
    console.error(`${approved ? 'Approve' : 'Reject'} transaction error:`, error);
    res.status(500).json({ success: false, message: 'Unable to update transaction approval.' });
  } finally {
    connection.release();
  }
}

const approveTransaction = (req, res) => updateApproval(req, res, true);
const rejectTransaction = (req, res) => updateApproval(req, res, false);

const bulkUpload = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const fileName = clean(req.body.fileName);
    const content = String(req.body.content ?? '');
    const uploadedBy = clean(req.body.uploadedBy);
    if (!fileName.toLowerCase().endsWith('.csv')) return res.status(400).json({ success: false, message: 'Only CSV files are supported.' });
    if (!content.trim()) return res.status(400).json({ success: false, message: 'CSV file is empty.' });
    if (content.length > 5_000_000) return res.status(400).json({ success: false, message: 'CSV file is too large. Maximum size is 5 MB.' });

    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return res.status(400).json({ success: false, message: 'CSV must contain a header and at least one record.' });

    const headers = lines[0].split(',').map(v => v.trim().toLowerCase());
    const requiredHeaders = ['debit account', 'beneficiary name', 'beneficiary account', 'ifsc', 'amount', 'purpose', 'remarks'];
    const missing = requiredHeaders.filter(h => !headers.includes(h));
    if (missing.length) return res.status(400).json({ success: false, message: `Missing CSV columns: ${missing.join(', ')}` });

    const idx = Object.fromEntries(requiredHeaders.map(h => [h, headers.indexOf(h)]));
    const records = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
    let validRecords = 0;
    let invalidRecords = 0;
    const errors = [];

    await connection.beginTransaction();
    const [uploadResult] = await connection.query(`INSERT INTO bulk_uploads (file_name, total_records, upload_status) VALUES (?, ?, 'PROCESSING')`, [fileName, records.length]);
    const bulkId = uploadResult.insertId;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const senderAccount = clean(row[idx['debit account']]);
      const beneficiaryName = clean(row[idx['beneficiary name']]);
      const beneficiaryAccount = clean(row[idx['beneficiary account']]);
      const ifsc = clean(row[idx.ifsc]).toUpperCase();
      const amount = Number(row[idx.amount]);
      const purpose = clean(row[idx.purpose]);
      const remarks = clean(row[idx.remarks]);
      const problems = [];
      if (!patterns.account.test(senderAccount)) problems.push('invalid debit account');
      if (!patterns.name.test(beneficiaryName)) problems.push('invalid beneficiary name');
      if (!patterns.account.test(beneficiaryAccount)) problems.push('invalid beneficiary account');
      if (!patterns.ifsc.test(ifsc)) problems.push('invalid IFSC');
      if (!validAmount(amount)) problems.push('invalid amount');
      if (!['Personal', 'Education', 'Medical', 'Business', 'Other'].includes(purpose)) problems.push('invalid purpose');
      if (remarks.length > 200) problems.push('remarks too long');

      const reference = `BULK-${Date.now()}-${i + 1}`;
      if (problems.length) {
        invalidRecords++;
        errors.push({ row: i + 2, message: problems.join(', ') });
        await connection.query(`INSERT INTO bulk_upload_records (bulk_upload_id, transaction_reference, transaction_type, amount, record_status, error_message) VALUES (?, ?, 'IMPS', ?, 'FAILED', ?)`, [bulkId, reference, Number.isFinite(amount) ? amount : 0, problems.join(', ')]);
        continue;
      }

      validRecords++;
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 100000)}${i + 1}`;
      const rrn = `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-12);
      await connection.query(
        `INSERT INTO transactions
         (transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
          beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code, initiated_by, response_message, transaction_date)
         VALUES (?, ?, 'IMPS', 'OUTBOUND', ?, 'Bulk Upload Customer', '9876543210', ?, ?, ?, ?, 'PENDING', 'BR001', ?, ?, NOW())`,
        [transactionId, rrn, senderAccount, beneficiaryAccount, beneficiaryName, ifsc, amount, uploadedBy || 'SYSTEM', remarks || 'Bulk transaction awaiting approval']
      );
      await connection.query(
        `INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks) VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', ?)`,
        [transactionId, uploadedBy || 'SYSTEM', remarks || 'Bulk transaction approval required']
      );
      await connection.query(`INSERT INTO bulk_upload_records (bulk_upload_id, transaction_reference, transaction_type, amount, record_status) VALUES (?, ?, 'IMPS', ?, 'VALID')`, [bulkId, transactionId, amount]);
    }

    await connection.query(`UPDATE bulk_uploads SET successful_records = ?, failed_records = ?, upload_status = ? WHERE id = ?`, [validRecords, invalidRecords, invalidRecords ? (validRecords ? 'PARTIAL' : 'FAILED') : 'VALIDATED', bulkId]);
    await connection.commit();
    res.status(201).json({ success: true, message: 'File validation completed.', data: { bulkUploadId: bulkId, totalRecords: records.length, validRecords, invalidRecords, errors } });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Unable to process bulk upload.' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  searchTransactions,
  getPendingApprovals,
  sendForApproval,
  approveTransaction,
  rejectTransaction,
  bulkUpload
};

```

## `backend/src/controllers/operationsController.js`

```javascript
const { pool } = require('../config/database');
const { patterns, clean, validAmount } = require('../utils/validation');

const listAccounts = async (req, res) => {
  try {
    const accountNumber = clean(req.query.accountNumber);
    let sql = `SELECT * FROM accounts WHERE 1=1`;
    const params = [];
    if (accountNumber) { sql += ` AND account_number = ?`; params.push(accountNumber); }
    sql += ` ORDER BY customer_name ASC LIMIT 200`;
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Unable to load accounts.' }); }
};

const accountStatement = async (req, res) => {
  try {
    const account = clean(req.params.accountNumber);
    const from = clean(req.query.from);
    const to = clean(req.query.to);
    if (!patterns.account.test(account)) return res.status(400).json({ success: false, message: 'Enter a valid account number.' });
    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) return res.status(400).json({ success: false, message: 'Invalid from date.' });
    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) return res.status(400).json({ success: false, message: 'Invalid to date.' });
    if (from && to && new Date(from) > new Date(to)) return res.status(400).json({ success: false, message: 'From date cannot be after to date.' });
    let sql = `SELECT transaction_id, rrn, direction, sender_account, beneficiary_account, amount, transaction_status, transaction_date FROM transactions WHERE (sender_account = ? OR beneficiary_account = ?)`;
    const params = [account, account];
    if (from) { sql += ` AND transaction_date >= ?`; params.push(`${from} 00:00:00`); }
    if (to) { sql += ` AND transaction_date <= ?`; params.push(`${to} 23:59:59`); }
    sql += ` ORDER BY transaction_date DESC LIMIT 500`;
    const [rows] = await pool.query(sql, params);
    const [accounts] = await pool.query(`SELECT * FROM accounts WHERE account_number = ? LIMIT 1`, [account]);
    res.json({ success: true, data: { account: accounts[0] || null, transactions: rows } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Unable to load account statement.' }); }
};

const listBeneficiaries = async (_req, res) => {
  try { const [rows] = await pool.query(`SELECT * FROM beneficiaries ORDER BY created_at DESC, id DESC`); res.json({ success: true, data: rows }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Unable to load beneficiaries.' }); }
};

const addBeneficiary = async (req, res) => {
  try {
    const customerName = clean(req.body.customerName);
    const accountNumber = clean(req.body.accountNumber).toUpperCase();
    const ifscCode = clean(req.body.ifscCode).toUpperCase();
    const bankName = clean(req.body.bankName);
    const mobileNumber = clean(req.body.mobileNumber);
    if (!patterns.name.test(customerName)) return res.status(400).json({ success: false, message: 'Enter a valid beneficiary name.' });
    if (!patterns.account.test(accountNumber)) return res.status(400).json({ success: false, message: 'Enter a valid account number.' });
    if (!patterns.ifsc.test(ifscCode)) return res.status(400).json({ success: false, message: 'Enter a valid IFSC code.' });
    if (mobileNumber && !patterns.mobile.test(mobileNumber)) return res.status(400).json({ success: false, message: 'Enter a valid mobile number.' });
    if (bankName.length > 150) return res.status(400).json({ success: false, message: 'Bank name is too long.' });
    const [result] = await pool.query(`INSERT INTO beneficiaries (customer_name, account_number, ifsc_code, bank_name, mobile_number, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')`, [customerName, accountNumber, ifscCode, bankName || null, mobileNumber || null]);
    res.status(201).json({ success: true, message: 'Beneficiary added successfully.', data: { id: result.insertId } });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Beneficiary already exists.' });
    console.error(e); res.status(500).json({ success: false, message: 'Unable to add beneficiary.' });
  }
};

const transactionReport = async (req, res) => {
  try {
    const status = clean(req.query.status).toUpperCase();
    const direction = clean(req.query.direction).toUpperCase();
    let sql = `SELECT * FROM transactions WHERE 1=1`; const params=[];
    if (status) { if (!['PENDING','SUCCESS','FAILED'].includes(status)) return res.status(400).json({success:false,message:'Invalid status.'}); sql += ` AND transaction_status=?`; params.push(status); }
    if (direction) { if (!['INBOUND','OUTBOUND','INWARD','OUTWARD'].includes(direction)) return res.status(400).json({success:false,message:'Invalid direction.'}); sql += ` AND direction=?`; params.push(direction); }
    sql += ` ORDER BY transaction_date DESC LIMIT 1000`;
    const [rows]=await pool.query(sql,params); res.json({success:true,data:rows});
  } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load transaction report.'});}
};

const settlementReport = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT DATE(transaction_date) report_date, COUNT(*) total_transactions, SUM(amount) total_amount, SUM(transaction_status='SUCCESS') successful, SUM(transaction_status='FAILED') failed, SUM(transaction_status='PENDING') pending FROM transactions GROUP BY DATE(transaction_date) ORDER BY report_date DESC LIMIT 90`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load settlement report.'});}
};

const reconciliationReport = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT transaction_status, COUNT(*) transaction_count, COALESCE(SUM(amount),0) total_amount FROM transactions GROUP BY transaction_status ORDER BY transaction_status`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load reconciliation report.'});}
};

const apiLogs = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT * FROM api_logs ORDER BY created_at DESC, id DESC LIMIT 200`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load API logs.'});}
};

const alerts = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC, id DESC LIMIT 200`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load alerts.'});}
};

const systemHealth = async (_req,res)=>{
  try { const connection=await pool.getConnection(); await connection.ping(); connection.release(); res.json({success:true,data:{api:'UP',database:'UP',timestamp:new Date().toISOString(),environment:process.env.NODE_ENV||'development'}}); }
  catch(e){console.error(e);res.status(503).json({success:false,message:'Database health check failed.',data:{api:'UP',database:'DOWN'}});}
};

const users = async (_req,res)=>{
  try { const [rows]=await pool.query(`SELECT id, organisation_id, employee_id, employee_name, email, branch_code, role, status, created_at, updated_at FROM users ORDER BY employee_name`); res.json({success:true,data:rows}); }
  catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load users.'});}
};

const createUser = async (req,res)=>{
  try { const {organisationId,employeeId,employeeName,email,password,branchCode,role}=req.body; if(!/^[A-Za-z0-9_-]{3,100}$/.test(clean(organisationId))) return res.status(400).json({success:false,message:'Invalid organisation ID.'}); if(!patterns.employeeId.test(clean(employeeId))) return res.status(400).json({success:false,message:'Invalid employee ID.'}); if(!patterns.name.test(clean(employeeName))) return res.status(400).json({success:false,message:'Invalid employee name.'}); if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(email))) return res.status(400).json({success:false,message:'Invalid email address.'}); if(String(password||'').length<6) return res.status(400).json({success:false,message:'Password must be at least 6 characters.'}); if(!patterns.branchCode.test(clean(branchCode))) return res.status(400).json({success:false,message:'Invalid branch code.'}); if(!['Maker','Checker','Admin','Viewer'].includes(role)) return res.status(400).json({success:false,message:'Invalid role.'}); const [r]=await pool.query(`INSERT INTO users (organisation_id,employee_id,employee_name,email,password,branch_code,role,status) VALUES (?,?,?,?,?,?,?,'ACTIVE')`,[clean(organisationId),clean(employeeId),clean(employeeName),clean(email)||null,password,clean(branchCode).toUpperCase(),role]); res.status(201).json({success:true,message:'User created successfully.',data:{id:r.insertId}}); }
  catch(e){if(e.code==='ER_DUP_ENTRY') return res.status(409).json({success:false,message:'Employee ID already exists.'}); console.error(e);res.status(500).json({success:false,message:'Unable to create user.'});}
};

const roles = async (_req,res)=>{ try { const [rows]=await pool.query(`SELECT role, COUNT(*) user_count FROM users GROUP BY role ORDER BY role`); res.json({success:true,data:rows}); } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load roles.'});} };

const systemSettings = async (_req,res)=>{ try { const [rows]=await pool.query(`SELECT * FROM system_config ORDER BY config_key`); res.json({success:true,data:rows}); } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to load system settings.'});} };

const saveSystemSetting = async (req,res)=>{ try { const key=clean(req.body.configKey); const value=String(req.body.configValue??''); const description=clean(req.body.description); if(!/^[A-Za-z0-9._-]{2,100}$/.test(key)) return res.status(400).json({success:false,message:'Invalid configuration key.'}); if(value.length>5000) return res.status(400).json({success:false,message:'Configuration value is too long.'}); await pool.query(`INSERT INTO system_config (config_key,config_value,description) VALUES (?,?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value), description=VALUES(description)`,[key,value,description||null]); res.json({success:true,message:'System setting saved successfully.'}); } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to save system setting.'});} };

module.exports={listAccounts,accountStatement,listBeneficiaries,addBeneficiary,transactionReport,settlementReport,reconciliationReport,apiLogs,alerts,systemHealth,users,createUser,roles,systemSettings,saveSystemSetting};

```

## `backend/src/routes/transactionRoutes.js`

```javascript
const express = require('express');

const router = express.Router();

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  getPendingApprovals,
  sendForApproval,
  approveTransaction,
  rejectTransaction,
  searchTransactions,
  bulkUpload
} = require('../controllers/transactionController');


// ========================================
// SEARCH
// ========================================

router.get(
  '/search',
  searchTransactions,
  bulkUpload
);


// ========================================
// PENDING APPROVALS
// ========================================


router.get(
  '/pending-approvals',
  getPendingApprovals
);
// ========================================
// SEND FOR APPROVAL
// ========================================

router.post(
  '/send-for-approval',
  sendForApproval
);


// ========================================
// APPROVE
// ========================================

router.post(
  '/approve',
  approveTransaction
);


// ========================================
// REJECT
// ========================================

router.post(
  '/reject',
  rejectTransaction
);

router.post(
  '/bulk-upload',
  bulkUpload
);


// ========================================
// GET ALL TRANSACTIONS
// ========================================

router.get(
  '/',
  getTransactions
);


// ========================================
// CREATE TRANSACTION
// ========================================

router.post(
  '/',
  createTransaction
);


// ========================================
// GET TRANSACTION BY ID
// ========================================

router.get(
  '/:transactionId',
  getTransactionById
);



module.exports = router;
```

## `backend/src/routes/operationsRoutes.js`

```javascript
const express = require('express');
const c = require('../controllers/operationsController');
const router = express.Router();
router.get('/accounts', c.listAccounts);
router.get('/accounts/:accountNumber/statement', c.accountStatement);
router.get('/beneficiaries', c.listBeneficiaries);
router.post('/beneficiaries', c.addBeneficiary);
router.get('/reports/transactions', c.transactionReport);
router.get('/reports/settlement', c.settlementReport);
router.get('/reports/reconciliation', c.reconciliationReport);
router.get('/monitoring/api-logs', c.apiLogs);
router.get('/monitoring/alerts', c.alerts);
router.get('/monitoring/system-health', c.systemHealth);
router.get('/settings/users', c.users);
router.post('/settings/users', c.createUser);
router.get('/settings/roles', c.roles);
router.get('/settings/system', c.systemSettings);
router.put('/settings/system', c.saveSystemSetting);
module.exports = router;

```

## `backend/src/utils/validation.js`

```javascript
const patterns = {
  organisationId: /^[A-Za-z0-9_-]{3,100}$/,
  employeeId: /^[A-Za-z0-9._-]{3,50}$/,
  branchCode: /^[A-Za-z0-9-]{2,20}$/,
  account: /^(?:\d{9,18}|X{2,}\d{4,18})$/,
  mobile: /^[6-9]\d{9}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  name: /^[A-Za-z][A-Za-z .'-]{1,99}$/,
  transactionId: /^[A-Za-z0-9_-]{6,50}$/,
  rrn: /^\d{6,20}$/
};

function clean(value) { return String(value ?? '').trim(); }
function required(value) { return clean(value).length > 0; }
function validAmount(value, max = 500000) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= max;
}

module.exports = { patterns, clean, required, validAmount };

```

## `database/seed-demo-users.sql`

```sql
USE imps_upi_db;

INSERT INTO users
(organisation_id, employee_id, employee_name, email, password, branch_code, role, status)
SELECT 'PROGRESSIVE-BANK', 'EMP1003', 'Test Admin', 'admin@progressivebank.com', 'Admin@123', 'BR001', 'Admin', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = 'EMP1003');

INSERT INTO users
(organisation_id, employee_id, employee_name, email, password, branch_code, role, status)
SELECT 'PROGRESSIVE-BANK', 'EMP1004', 'Test Checker', 'checker@progressivebank.com', 'Checker@123', 'BR001', 'Checker', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = 'EMP1004');

```

## `database/seed-demo-data.sql`

```sql
USE imps_upi_db;

INSERT INTO accounts (account_number, customer_name, account_type, balance, branch_code, status)
SELECT '123456789012', 'Test Customer', 'Savings', 125000.00, 'BR001', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number='123456789012');

INSERT INTO accounts (account_number, customer_name, account_type, balance, branch_code, status)
SELECT '123456789013', 'Test Customer', 'Current', 250000.00, 'BR001', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number='123456789013');

INSERT INTO beneficiaries (customer_name, account_number, ifsc_code, bank_name, mobile_number, status)
SELECT 'Demo Beneficiary', '987654321098', 'SBIN0001234', 'State Bank Demo', '9876543211', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM beneficiaries WHERE account_number='987654321098');

INSERT INTO notifications (user_id, title, message, notification_type, is_read)
SELECT 1, 'Pending approvals', 'Transactions are waiting for checker approval.', 'TRANSACTION', 0
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title='Pending approvals');

INSERT INTO system_config (config_key, config_value, description)
SELECT 'environment', 'UAT', 'Current application environment'
WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE config_key='environment');

INSERT INTO system_config (config_key, config_value, description)
SELECT 'max_imps_amount', '500000', 'Maximum IMPS amount accepted by application validation'
WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE config_key='max_imps_amount');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-001','100000000001','IMPS','OUTBOUND','123456789012','Test Customer','9876543210',
'987654321098','Demo Beneficiary','SBIN0001234',12500.00,'SUCCESS','BR001','EMP1002','EMP1003','00','Transaction approved','2026-08-18 10:15:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-001');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-002','100000000002','IMPS','OUTBOUND','123456789012','Test Customer','9876543210',
'987654321099','Rahul Patil','HDFC0001234',7500.00,'FAILED','BR001','EMP1002','EMP1003','91','Transaction declined','2026-08-18 11:30:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-002');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-003','100000000003','IMPS','INBOUND','987654321098','Demo Sender','9876543211',
'123456789012','Test Customer','SBIN0001234',15000.00,'SUCCESS','BR001','EMP1003','EMP1003','00','Transaction received','2026-08-18 14:10:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-003');

INSERT INTO transactions
(transaction_id, rrn, transaction_type, direction, sender_account, sender_name, sender_mobile,
 beneficiary_account, beneficiary_name, beneficiary_ifsc, amount, transaction_status, branch_code,
 initiated_by, approved_by, response_code, response_message, transaction_date)
SELECT 'TXN-DEMO-004','100000000004','IMPS','OUTBOUND','123456789013','Test Customer','9876543210',
'987654321100','Sneha Kulkarni','ICIC0001234',25000.00,'PENDING','BR001','EMP1002',NULL,NULL,'Awaiting checker approval','2026-08-18 15:20:00'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id='TXN-DEMO-004');

INSERT INTO pending_approvals (transaction_id, requested_by, requested_at, status, remarks)
SELECT 'TXN-DEMO-004','EMP1002','2026-08-18 15:20:00','PENDING','IMPS transaction approval required'
WHERE NOT EXISTS (SELECT 1 FROM pending_approvals WHERE transaction_id='TXN-DEMO-004' AND status='PENDING');

```
