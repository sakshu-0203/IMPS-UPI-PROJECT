import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  private readonly apiUrl = 'http://localhost:5000/api/operations';

  constructor(private http: HttpClient) {}

  // =========================
  // ACCOUNTS
  // =========================

  getAccounts(accountNumber = ''): Observable<any> {

    let params = new HttpParams();

    if (accountNumber) {
      params = params.set('accountNumber', accountNumber);
    }

    return this.http.get<any>(
      `${this.apiUrl}/accounts`,
      { params }
    );
  }


  // =========================
  // ACCOUNT STATEMENT
  // =========================

 getAccountStatement(
  accountNumber: string,
  from = '',
  to = ''
): Observable<any> {

  const url =
    `${this.apiUrl}/accounts/${encodeURIComponent(accountNumber)}/statement`;

  let params = new HttpParams();

  // HTML date value: 2026-08-02
  if (from) {
    params = params.set('from', from);
  }

  if (to) {
    params = params.set('to', to);
  }

  console.log('ACCOUNT STATEMENT REQUEST');
  console.log('URL:', url);
  console.log('FROM:', from);
  console.log('TO:', to);

  return this.http.get<any>(url, {
    params: params
  });
}


  // =========================
  // BENEFICIARIES
  // =========================

  getBeneficiaries(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/beneficiaries`
    );
  }


  addBeneficiary(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/beneficiaries`,
      data
    );
  }


  // =========================
  // TRANSACTION REPORT
  // =========================

  getTransactionReport(
    status = '',
    direction = ''
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/reports/transactions`,
      {
        params: {
          status,
          direction
        }
      }
    );
  }


  // =========================
  // SETTLEMENT REPORT
  // =========================

  getSettlementReport(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/reports/settlement`
    );
  }


  // =========================
  // RECONCILIATION
  // =========================

  getReconciliationReport(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/reports/reconciliation`
    );
  }


  // =========================
  // MONITORING
  // =========================

  getApiLogs(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/monitoring/api-logs`
    );
  }


  getAlerts(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/monitoring/alerts`
    );
  }


  getSystemHealth(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/monitoring/system-health`
    );
  }


  // =========================
  // USERS
  // =========================

  getUsers(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/settings/users`
    );
  }


  createUser(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/settings/users`,
      data
    );
  }


  // =========================
  // ROLES
  // =========================

  getRoles(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/settings/roles`
    );
  }


  // =========================
  // SYSTEM SETTINGS
  // =========================

  getSystemSettings(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/settings/system`
    );
  }


  saveSystemSetting(data: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/settings/system`,
      data
    );
  }


  // =========================
  // BULK UPLOAD
  // =========================

  uploadBulkFile(data: any): Observable<any> {
    return this.http.post<any>(
      'http://localhost:5000/api/transactions/bulk-upload',
      data
    );
  }
}