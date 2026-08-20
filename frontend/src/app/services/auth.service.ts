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
