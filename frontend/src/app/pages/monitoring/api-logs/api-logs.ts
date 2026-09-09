import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../services/operations.service';

// Interfaces
interface ApiLog {
	id: string;
	timestamp: string;
	apiName: string;
	httpMethod: string;
	endpoint: string;
	requestId: string;
	transactionId: string;
	httpStatus: number;
	status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'TIMEOUT' | 'UNAUTHORIZED';
	responseTime: number;
	requestHeaders?: any;
	requestBody?: any;
	response?: any;
}

interface SummaryCard {
	label: string;
	value: number | string;
	icon: string;
	className: string;
}

@Component({
	selector: 'app-api-logs',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './api-logs.html',
	styleUrl: './api-logs.css'
})
export class ApiLogs implements OnInit {
	// Summary Cards
	summaryCards: SummaryCard[] = [];

	// Table & Pagination
	allLogs: ApiLog[] = [];
	filteredLogs: ApiLog[] = [];
	paginatedLogs: ApiLog[] = [];

	currentPage = 1;
	pageSize = 10;
	totalPages = 0;
	pageNumbers: number[] = [];

	// States
	loading = false;
	errorMessage = '';
	hasSearched = false;

	// Details Modal
	selectedLog: ApiLog | null = null;
	showDetailsModal = false;

	// Performance Data
	performanceData: any = {};

	constructor(private opsService: OperationsService) {
		this.allLogs = this.getMockApiLogs();
		this.calculateSummary();
		this.search();
	}

	ngOnInit(): void {
		this.loadApiLogs();
	}

	// ========================================
	// LOAD API LOGS
	// ========================================

	loadApiLogs(): void {
		this.loading = true;
		this.errorMessage = '';

		// Keep the page populated while the optional backend request is pending.
		if (this.allLogs.length === 0) {
			this.allLogs = this.getMockApiLogs();
		}
		this.calculateSummary();
		this.search();
		this.loading = false;

		// Try to fetch from backend in the background
		this.opsService.getApiLogs().subscribe({
			next: (response) => {
				if (response?.success && Array.isArray(response.data)) {
					// Update with real data from backend
					this.allLogs = response.data.map((log: any) =>
						this.normalizeApiLog(log)
					);
					this.calculateSummary();
					this.search();
					this.errorMessage = '';
				} else {
					this.errorMessage =
						response?.message || 'Using demo data (backend unavailable)';
				}
			},
			error: (error) => {
				// Backend is unavailable, but we already have mock data loaded
				console.warn('Backend API unavailable, using demo data:', error);
			}
		});
	}

	// ========================================
	// MOCK DATA GENERATOR
	// ========================================

	getMockApiLogs(): ApiLog[] {
		const mockLogs: ApiLog[] = [
			{
				id: 'LOG-001',
				timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
				apiName: 'IMPS Transfer',
				httpMethod: 'POST',
				endpoint: '/api/imps/transfer',
				requestId: 'REQ-10234',
				transactionId: 'IMPS202609031024',
				httpStatus: 200,
				status: 'SUCCESS',
				responseTime: 182,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********',
					'X-Request-ID': 'REQ-10234'
				},
				requestBody: {
					senderAccount: 'XXXXXX1234',
					beneficiaryAccount: 'XXXXXX5678',
					amount: 5000,
					remark: 'Payment for services'
				},
				response: {
					status: 'SUCCESS',
					transactionId: 'IMPS202609031024',
					message: 'Transaction processed successfully',
					timestamp: new Date().toISOString()
				}
			},
			{
				id: 'LOG-002',
				timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
				apiName: 'Account Verification',
				httpMethod: 'POST',
				endpoint: '/api/account/verify',
				requestId: 'REQ-10233',
				transactionId: '-',
				httpStatus: 200,
				status: 'SUCCESS',
				responseTime: 95,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********'
				},
				requestBody: {
					accountNumber: 'XXXXXX1234',
					ifscCode: 'ICIC0000001'
				},
				response: {
					status: 'SUCCESS',
					valid: true,
					accountHolder: 'John Doe',
					accountType: 'Savings'
				}
			},
			{
				id: 'LOG-003',
				timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
				apiName: 'IMPS Transfer',
				httpMethod: 'POST',
				endpoint: '/api/imps/transfer',
				requestId: 'REQ-10232',
				transactionId: 'IMPS202609031023',
				httpStatus: 500,
				status: 'FAILED',
				responseTime: 523,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********'
				},
				requestBody: {
					senderAccount: 'XXXXXX9999',
					beneficiaryAccount: 'XXXXXX8888',
					amount: 10000
				},
				response: {
					status: 'FAILED',
					error: 'Insufficient balance',
					errorCode: 'INSUFFICIENT_BALANCE'
				}
			},
			{
				id: 'LOG-004',
				timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
				apiName: 'Balance Inquiry',
				httpMethod: 'GET',
				endpoint: '/api/balance/inquiry',
				requestId: 'REQ-10231',
				transactionId: '-',
				httpStatus: 200,
				status: 'SUCCESS',
				responseTime: 64,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********'
				},
				requestBody: {
					accountNumber: 'XXXXXX1234'
				},
				response: {
					status: 'SUCCESS',
					balance: 'XXXXXX50000',
					currency: 'INR',
					lastUpdated: new Date().toISOString()
				}
			},
			{
				id: 'LOG-005',
				timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
				apiName: 'IFSC Validation',
				httpMethod: 'GET',
				endpoint: '/api/ifsc/validate',
				requestId: 'REQ-10230',
				transactionId: '-',
				httpStatus: 200,
				status: 'SUCCESS',
				responseTime: 120,
				requestHeaders: {
					'Content-Type': 'application/json'
				},
				requestBody: {
					ifscCode: 'ICIC0000001'
				},
				response: {
					status: 'SUCCESS',
					valid: true,
					bankName: 'ICICI Bank',
					branchName: 'Mumbai Branch'
				}
			},
			{
				id: 'LOG-006',
				timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
				apiName: 'Transaction Reversal',
				httpMethod: 'POST',
				endpoint: '/api/transaction/reverse',
				requestId: 'REQ-10229',
				transactionId: 'REV-202609031022',
				httpStatus: 408,
				status: 'TIMEOUT',
				responseTime: 5000,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********'
				},
				requestBody: {
					originalTransactionId: 'IMPS202609031020'
				},
				response: {
					status: 'TIMEOUT',
					message: 'Request timeout'
				}
			},
			{
				id: 'LOG-007',
				timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
				apiName: 'Beneficiary Validation',
				httpMethod: 'POST',
				endpoint: '/api/beneficiary/validate',
				requestId: 'REQ-10228',
				transactionId: '-',
				httpStatus: 401,
				status: 'UNAUTHORIZED',
				responseTime: 45,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer EXPIRED'
				},
				requestBody: {
					beneficiaryId: 'BEN-001'
				},
				response: {
					status: 'UNAUTHORIZED',
					error: 'Invalid or expired token',
					errorCode: 'AUTH_EXPIRED'
				}
			},
			{
				id: 'LOG-008',
				timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
				apiName: 'Transaction Status',
				httpMethod: 'GET',
				endpoint: '/api/transaction/status',
				requestId: 'REQ-10227',
				transactionId: 'IMPS202609031019',
				httpStatus: 200,
				status: 'SUCCESS',
				responseTime: 156,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********'
				},
				requestBody: {
					transactionId: 'IMPS202609031019'
				},
				response: {
					status: 'SUCCESS',
					transactionStatus: 'COMPLETED',
					settlementDate: new Date().toISOString()
				}
			},
			{
				id: 'LOG-009',
				timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
				apiName: 'IMPS Transfer',
				httpMethod: 'POST',
				endpoint: '/api/imps/transfer',
				requestId: 'REQ-10226',
				transactionId: 'IMPS202609031018',
				httpStatus: 202,
				status: 'PENDING',
				responseTime: 234,
				requestHeaders: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ********'
				},
				requestBody: {
					senderAccount: 'XXXXXX7777',
					beneficiaryAccount: 'XXXXXX6666',
					amount: 2500
				},
				response: {
					status: 'PENDING',
					message: 'Transaction queued for processing',
					expectedTime: '5-10 minutes'
				}
			},
			{
				id: 'LOG-010',
				timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
				apiName: 'Authentication',
				httpMethod: 'POST',
				endpoint: '/api/auth/login',
				requestId: 'REQ-10225',
				transactionId: '-',
				httpStatus: 200,
				status: 'SUCCESS',
				responseTime: 89,
				requestHeaders: {
					'Content-Type': 'application/json'
				},
				requestBody: {
					username: 'XXXXXX',
					password: '****'
				},
				response: {
					status: 'SUCCESS',
					token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
					user: {
						id: 'USER-001',
						name: 'Admin User',
						role: 'ADMIN'
					}
				}
			}
		];

		return mockLogs;
	}

	// ========================================
	// CALCULATE SUMMARY
	// ========================================

	calculateSummary(): void {
		const total = this.allLogs.length;
		const successful = this.allLogs.filter(
			(log) => log.status === 'SUCCESS'
		).length;
		const failed = this.allLogs.filter(
			(log) => log.status === 'FAILED'
		).length;
		const pending = this.allLogs.filter(
			(log) => log.status === 'PENDING'
		).length;

		const avgResponseTime =
			this.allLogs.length > 0
				? Math.round(
						this.allLogs.reduce((sum, log) => sum + log.responseTime, 0) /
							this.allLogs.length
				  )
				: 0;

		this.summaryCards = [
			{
				label: 'Total Requests',
				value: total.toLocaleString('en-IN'),
				icon: 'bi-diagram-3',
				className: 'total-card'
			},
			{
				label: 'Successful',
				value: successful.toLocaleString('en-IN'),
				icon: 'bi-check-circle-fill',
				className: 'success-card'
			},
			{
				label: 'Failed',
				value: failed.toLocaleString('en-IN'),
				icon: 'bi-x-circle-fill',
				className: 'failed-card'
			},
			{
				label: 'Pending',
				value: pending.toLocaleString('en-IN'),
				icon: 'bi-hourglass-split',
				className: 'pending-card'
			},
			{
				label: 'Avg Response Time',
				value: `${avgResponseTime} ms`,
				icon: 'bi-speedometer2',
				className: 'response-card'
			}
		];

		this.calculatePerformanceData();
	}

	// ========================================
	// CALCULATE PERFORMANCE DATA
	// ========================================

	calculatePerformanceData(): void {
		// Group logs by hour for trend
		const hourlyRequests: { [key: string]: number } = {};
		const hourlySuccess: { [key: string]: number } = {};
		const hourlyFailed: { [key: string]: number } = {};

		this.allLogs.forEach((log) => {
			const date = new Date(log.timestamp);
			const hour = date.getHours();
			const key = `${hour}:00`;

			hourlyRequests[key] = (hourlyRequests[key] || 0) + 1;
			if (log.status === 'SUCCESS') {
				hourlySuccess[key] = (hourlySuccess[key] || 0) + 1;
			}
			if (log.status === 'FAILED') {
				hourlyFailed[key] = (hourlyFailed[key] || 0) + 1;
			}
		});

		this.performanceData = {
			hourlyRequests,
			hourlySuccess,
			hourlyFailed,
			successRate: this.calculateSuccessRate()
		};
	}

	calculateSuccessRate(): number {
		if (this.allLogs.length === 0) return 0;
		const successful = this.allLogs.filter(
			(log) => log.status === 'SUCCESS'
		).length;
		return Math.round((successful / this.allLogs.length) * 100);
	}

	// ========================================
	// SEARCH & PAGINATION
	// ========================================

	search(): void {
		this.hasSearched = true;
		this.currentPage = 1;
		this.filteredLogs = [...this.allLogs];
		this.updatePagination();
	}

	// ========================================
	// PAGINATION
	// ========================================

	updatePagination(): void {
		this.totalPages = Math.ceil(this.filteredLogs.length / this.pageSize);
		this.pageNumbers = Array.from(
			{ length: this.totalPages },
			(_, index) => index + 1
		);
		this.goToPage(1);
	}

	goToPage(page: number): void {
		if (page < 1 || page > this.totalPages) return;
		this.currentPage = page;
		const startIndex = (page - 1) * this.pageSize;
		const endIndex = startIndex + this.pageSize;
		this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
	}

	nextPage(): void {
		this.goToPage(this.currentPage + 1);
	}

	prevPage(): void {
		this.goToPage(this.currentPage - 1);
	}

	// ========================================
	// DETAILS MODAL
	// ========================================

	openDetails(log: ApiLog): void {
		console.log('Opening details for log:', log);
		this.selectedLog = log;
		this.showDetailsModal = true;
		console.log('Modal visibility:', this.showDetailsModal);
	}

	closeModal(): void {
		console.log('Closing modal');
		this.selectedLog = null;
		this.showDetailsModal = false;
	}

	// ========================================
	// UTILITIES
	// ========================================

	normalizeApiLog(log: any): ApiLog {
		const statusCode = Number(log.status_code ?? log.httpStatus ?? 0);
		const status = statusCode >= 200 && statusCode < 300
			? 'SUCCESS'
			: statusCode >= 400
				? 'FAILED'
				: 'PENDING';

		return {
			id: String(log.id ?? log.logId ?? ''),
			timestamp: log.created_at ?? log.timestamp,
			apiName: log.api_name ?? log.apiName ?? 'API Request',
			httpMethod: log.request_method ?? log.httpMethod ?? '-',
			endpoint: log.endpoint ?? '-',
			requestId: log.request_id ?? log.requestId ?? `LOG-${log.id ?? '-'}`,
			transactionId: log.transaction_id ?? log.transactionId ?? '-',
			httpStatus: statusCode,
			status: log.status ?? status,
			responseTime: Number(log.execution_time_ms ?? log.responseTime ?? 0),
			requestHeaders: this.parseLogData(log.request_headers ?? log.requestHeaders) ?? {
				'Content-Type': 'application/json',
				'X-Request-ID': log.request_id ?? log.requestId ?? `LOG-${log.id ?? '-'}`
			},
			requestBody: this.parseLogData(log.request_body ?? log.requestBody) ?? {
				method: log.request_method ?? log.httpMethod ?? '-',
				endpoint: log.endpoint ?? '-'
			},
			response: this.parseLogData(log.response_body ?? log.response) ?? {
				status: log.status ?? status,
				statusCode,
				message: 'Response body was not recorded for this log.'
			}
		};
	}

	parseLogData(data: any): any {
		if (!data) return data;
		if (typeof data !== 'string') return data;
		try {
			return JSON.parse(data);
		} catch {
			return data;
		}
	}

	refresh(): void {
		this.loadApiLogs();
	}

	maskSensitiveData(data: any): any {
		if (!data) return data;

		const masked = JSON.parse(JSON.stringify(data));

		const maskField = (obj: any, fields: string[]) => {
			if (typeof obj !== 'object' || obj === null) return;

			Object.keys(obj).forEach((key) => {
				if (
					fields.some(
						(field) =>
							key.toLowerCase().includes(field.toLowerCase())
					)
				) {
					if (typeof obj[key] === 'string' && obj[key].length > 4) {
						obj[key] =
							obj[key].substring(0, 4) +
							'*'.repeat(Math.min(obj[key].length - 8, 10)) +
							obj[key].substring(obj[key].length - 4);
					} else {
						obj[key] = '****';
					}
				} else if (typeof obj[key] === 'object') {
					maskField(obj[key], fields);
				}
			});
		};

		maskField(masked, [
			'password',
			'otp',
			'pin',
			'cvv',
			'token',
			'authorization',
			'account',
			'pan'
		]);

		return masked;
	}

	formatJson(data: any): string {
		if (!data) return 'No data recorded';
		try {
			const parsed = typeof data === 'string' ? JSON.parse(data) : data;
			return JSON.stringify(this.maskSensitiveData(parsed), null, 2);
		} catch (e) {
			return String(data);
		}
	}

	getStatusIcon(status: string): string {
		const iconMap: { [key: string]: string } = {
			'SUCCESS': 'bi-check-circle-fill',
			'FAILED': 'bi-x-circle-fill',
			'PENDING': 'bi-hourglass-split',
			'TIMEOUT': 'bi-clock-history',
			'UNAUTHORIZED': 'bi-shield-lock'
		};
		return iconMap[status] || 'bi-info-circle';
	}

	getStatusLowerCase(status: string | undefined): string {
		return status ? status.toLowerCase() : '';
	}

	getMethodLowerCase(method: string | undefined): string {
		return method ? method.toLowerCase() : '';
	}

	getMinResponseTime(): number {
		if (this.allLogs.length === 0) return 0;
		const times = this.allLogs.map(l => l.responseTime).sort((a, b) => a - b);
		return times[0] || 0;
	}
}
