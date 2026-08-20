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
