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
