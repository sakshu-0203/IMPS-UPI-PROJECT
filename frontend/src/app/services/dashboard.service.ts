import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';

export interface DashboardSummary {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalAmount: number;
}

export interface DashboardResponse {
  success: boolean;
  message?: string;
  data: {
    summary: DashboardSummary;
    recentTransactions: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = 'http://localhost:5000/api/dashboard';
  private readonly transactionsUrl = 'http://localhost:5000/api/transactions';

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardResponse> {
    return this.http
      .get<DashboardResponse>(`${this.apiUrl}/summary`)
      .pipe(
        timeout(8000),
        catchError((dashboardError) => {
          console.error('[Dashboard] /summary failed:', dashboardError);

          // Fallback keeps the dashboard usable if only the summary endpoint
          // is unavailable. The transaction API is already used by the app.
          return this.http.get<any>(this.transactionsUrl).pipe(
            timeout(8000),
            map((response) => {
              if (!response?.success || !Array.isArray(response.data)) {
                throw dashboardError;
              }

              const rows = response.data;

              const summary: DashboardSummary = {
                totalTransactions: rows.length,
                successfulTransactions: rows.filter(
                  (row: any) => String(row.transaction_status).toUpperCase() === 'SUCCESS'
                ).length,
                pendingTransactions: rows.filter(
                  (row: any) => String(row.transaction_status).toUpperCase() === 'PENDING'
                ).length,
                failedTransactions: rows.filter(
                  (row: any) => String(row.transaction_status).toUpperCase() === 'FAILED'
                ).length,
                totalAmount: rows.reduce(
                  (total: number, row: any) => total + Number(row.amount || 0),
                  0
                )
              };

              return {
                success: true,
                message: 'Dashboard loaded from transaction data.',
                data: {
                  summary,
                  recentTransactions: rows.slice(0, 10)
                }
              };
            }),
            catchError((fallbackError) => {
              console.error('[Dashboard] transaction fallback failed:', fallbackError);
              return throwError(() => dashboardError);
            })
          );
        })
      );
  }
}
