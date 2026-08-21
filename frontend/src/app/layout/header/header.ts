import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  profileOpen = false;
  logoutModalOpen = false;

  userName = 'Admin';
  userRole = 'Operations';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const user = this.authService.getUser();

    if (user) {

      this.userName =
        user.name ||
        user.full_name ||
        user.employee_name ||
        user.employee_id ||
        'Admin';

      this.userRole =
        user.role ||
        user.designation ||
        'Operations';
    }
  }


  toggleProfile(): void {

    this.profileOpen = !this.profileOpen;

  }


  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    const clickedInsideProfile =
      !!target.closest('.user-menu');

    if (!clickedInsideProfile) {

      this.profileOpen = false;

    }
  }


  openLogoutConfirmation(event?: MouseEvent): void {

    event?.stopPropagation();

    this.profileOpen = false;

    this.logoutModalOpen = true;
  }


  cancelLogout(event?: MouseEvent): void {

    event?.stopPropagation();

    this.logoutModalOpen = false;
  }


  confirmLogout(event?: MouseEvent): void {

    event?.stopPropagation();

    this.logoutModalOpen = false;

    this.profileOpen = false;

    this.authService.logout();

    this.router.navigate(['/login']);
  }


  closeLogoutModalFromBackdrop(event: MouseEvent): void {

    if (event.target === event.currentTarget) {

      this.logoutModalOpen = false;

    }
  }


  @HostListener('document:keydown.escape')
  handleEscape(): void {

    if (this.logoutModalOpen) {

      this.logoutModalOpen = false;

    } else if (this.profileOpen) {

      this.profileOpen = false;

    }
  }
}