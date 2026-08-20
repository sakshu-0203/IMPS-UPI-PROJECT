import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl =
    'http://localhost:5000/api/transactions';

  constructor(
    private http: HttpClient
  ) {}

  // ========================================
  // GET ALL TRANSACTIONS
  // ========================================

  getTransactions(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}`
    );

  }


  // ========================================
  // GET TRANSACTION BY ID
  // ========================================

  getTransactionById(
    transactionId: string
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${transactionId}`
    );

  }


  // ========================================
  // CREATE TRANSACTION
  // ========================================

  createTransaction(
    data: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}`,
      data
    );

  }


  // ========================================
  // SEND FOR APPROVAL
  // ========================================

  sendForApproval(
    data: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/send-for-approval`,
      data
    );

  }


  // ========================================
  // GET PENDING APPROVALS
  // ========================================

  getPendingApprovals(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/pending-approvals`
    );

  }


  // ========================================
  // APPROVE TRANSACTION
  // ========================================

  approveTransaction(
    transactionId: string,
    approvedBy: string,
    remarks: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/approve`,
      {
        transactionId,
        approvedBy,
        remarks
      }
    );

  }


  // ========================================
  // REJECT TRANSACTION
  // ========================================

  rejectTransaction(
    transactionId: string,
    approvedBy: string,
    remarks: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/reject`,
      {
        transactionId,
        approvedBy,
        remarks
      }
    );

  }


  // ========================================
  // SEARCH TRANSACTIONS
  // ========================================

  searchTransactions(
    params: any
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/search`,
      {
        params
      }
    );

  }

}