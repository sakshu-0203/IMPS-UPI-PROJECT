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
