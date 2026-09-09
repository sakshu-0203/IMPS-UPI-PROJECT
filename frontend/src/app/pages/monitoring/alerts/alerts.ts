import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../services/operations.service';
import { finalize, timeout } from 'rxjs';

interface Notification {
	id: number | string;
	title: string;
	message: string;
	notification_type?: string;
	is_read?: boolean | number;
	created_at?: string;
}

@Component({
	selector: 'app-alerts',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './alerts.html',
	styleUrl: './alerts.css'
})
export class Alerts implements OnInit {
	rows: Notification[] = [];
	errorMessage = '';
	loading = false;

	constructor(private ops: OperationsService) {}

	ngOnInit(): void {
		this.load();
	}

	load(): void {
		this.loading = true;
		this.errorMessage = '';

		this.ops.getAlerts().pipe(
			timeout(10000),
			finalize(() => this.loading = false)
		).subscribe({
			next: (response) => {
				const data = Array.isArray(response) ? response : response?.data;
				this.rows = Array.isArray(data) ? data : [];
				this.errorMessage = response?.success === false
					? response.message || 'Unable to load alerts.'
					: '';
			},
			error: (error) => {
				this.rows = [];
				this.errorMessage = error?.error?.message || 'Unable to load alerts.';
			}
		});
	}

	getType(notification: Notification): string {
		return (notification.notification_type || 'SYSTEM').replace(/_/g, ' ');
	}

	isUnread(notification: Notification): boolean {
		return notification.is_read === false || notification.is_read === 0;
	}
}
