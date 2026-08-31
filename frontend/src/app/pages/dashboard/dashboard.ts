import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DashboardService,
  DashboardSummary
} from '../../services/dashboard.service';
import { normalizeTransactionDirection } from '../../utils/validation';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalTransactions = 0;
  successfulTransactions = 0;
  pendingTransactions = 0;
  failedTransactions = 0;
  totalAmount = 0;
  recentTransactions: any[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[Dashboard] ngOnInit');
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('[Dashboard] Requesting dashboard data...');

    this.dashboardService.getDashboardSummary().subscribe({
      next: (response) => {
        console.log('[Dashboard] API response:', response);
        this.loading = false;

        if (!response?.success) {
          this.errorMessage = response?.message || 'Unable to load dashboard.';
          return;
        }

        const summary: DashboardSummary = response.data?.summary || {
          totalTransactions: 0,
          successfulTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
          totalAmount: 0
        };

        this.totalTransactions = Number(summary.totalTransactions || 0);
        this.successfulTransactions = Number(summary.successfulTransactions || 0);
        this.pendingTransactions = Number(summary.pendingTransactions || 0);
        this.failedTransactions = Number(summary.failedTransactions || 0);
        this.totalAmount = Number(summary.totalAmount || 0);
        this.recentTransactions = Array.isArray(response.data?.recentTransactions)
          ? response.data.recentTransactions
          : [];
      },
      error: (error) => {
        console.error('[Dashboard] API error:', error);
        this.loading = false;

        if (error?.status === 0) {
          this.errorMessage = 'Cannot connect to backend at http://localhost:5000.';
        } else {
          this.errorMessage =
            error?.error?.message ||
            'Unable to load dashboard data.';
        }
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }

  viewTransaction(tx: any): void {
    const direction = normalizeTransactionDirection(tx);
    const txnId = tx.transaction_id || tx.transactionId || tx.id || tx.rrn;
    const targetRoute = direction === 'INBOUND' ? '/transactions/inbound' : '/transactions/outbound';
    this.router.navigate([targetRoute], { queryParams: { id: txnId } });
  }

  formatAmount(amount: number): string {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
