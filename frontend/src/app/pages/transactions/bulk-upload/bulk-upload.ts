import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../../../services/operations.service';
import { AuthService } from '../../../services/auth.service';
import { VALIDATION, validAmount } from '../../../utils/validation';

@Component({
  selector: 'app-bulk-upload', standalone: true, imports: [CommonModule],
  templateUrl: './bulk-upload.html', styleUrl: './bulk-upload.css'
})
export class BulkUpload {
  selectedFile: File | null = null;
  uploadStatus = '';
  totalRecords = 0; validRecords = 0; invalidRecords = 0;
  errors: Array<{ row: number; message: string }> = [];
  processing = false;

  constructor(private operations: OperationsService, private auth: AuthService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.resetResult();
    const file = input.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { this.uploadStatus = 'Please select a CSV file.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.uploadStatus = 'File size must not exceed 5 MB.'; return; }
    this.selectedFile = file;
  }

  removeFile(): void { this.selectedFile = null; this.resetResult(); }
  private resetResult(): void { this.uploadStatus = ''; this.totalRecords = 0; this.validRecords = 0; this.invalidRecords = 0; this.errors = []; }

  async validateFile(): Promise<void> {
    if (!this.selectedFile) { this.uploadStatus = 'Please select a file first.'; return; }
    if (this.processing) return;
    this.processing = true;
    try {
      const content = await this.selectedFile.text();
      this.operationsValidation(content);
    } finally { this.processing = false; }
  }

  private operationsValidation(content: string): void {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) { this.uploadStatus = 'CSV must contain a header and at least one record.'; return; }
    const headers = lines[0].split(',').map(v => v.trim().toLowerCase());
    const required = ['debit account','beneficiary name','beneficiary account','ifsc','amount','purpose','remarks'];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length) { this.uploadStatus = `Missing columns: ${missing.join(', ')}`; return; }
    const idx = Object.fromEntries(required.map(h => [h, headers.indexOf(h)]));
    this.totalRecords = lines.length - 1; this.validRecords = 0; this.invalidRecords = 0; this.errors = [];
    lines.slice(1).forEach((line, index) => {
      const row = line.split(',').map(v => v.trim()); const problems: string[] = [];
      if (!VALIDATION.accountNumber.test(row[idx['debit account']] || '')) problems.push('invalid debit account');
      if (!VALIDATION.name.test(row[idx['beneficiary name']] || '')) problems.push('invalid beneficiary name');
      if (!VALIDATION.accountNumber.test(row[idx['beneficiary account']] || '')) problems.push('invalid beneficiary account');
      if (!VALIDATION.ifsc.test((row[idx.ifsc] || '').toUpperCase())) problems.push('invalid IFSC');
      if (!validAmount(row[idx.amount])) problems.push('invalid amount');
      if (!['Personal','Education','Medical','Business','Other'].includes(row[idx.purpose])) problems.push('invalid purpose');
      if ((row[idx.remarks] || '').length > 200) problems.push('remarks too long');
      if (problems.length) { this.invalidRecords++; this.errors.push({ row: index + 2, message: problems.join(', ') }); } else this.validRecords++;
    });
    this.uploadStatus = this.invalidRecords ? `Validation completed: ${this.validRecords} valid, ${this.invalidRecords} invalid.` : 'Validation completed successfully. All records are valid.';
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) { this.uploadStatus = 'Please select a file first.'; return; }
    if (this.processing) return;
    this.processing = true;
    try {
      const content = await this.selectedFile.text();
      const user = this.auth.getUser();
      this.uploadViaTransactionService(content, user?.employeeId || 'SYSTEM');
    } catch { this.processing = false; }
  }

  private uploadViaTransactionService(content: string, uploadedBy: string): void {
    this.operations.uploadBulkFile({ fileName: this.selectedFile?.name, content, uploadedBy })?.subscribe({
      next: (response: any) => { this.processing = false; if (response?.success) { const d=response.data; this.totalRecords=d.totalRecords; this.validRecords=d.validRecords; this.invalidRecords=d.invalidRecords; this.errors=d.errors||[]; this.uploadStatus=response.message; } else this.uploadStatus=response?.message||'Upload failed.'; },
      error: (error: any) => { this.processing=false; this.uploadStatus=error?.error?.message||'Unable to upload file.'; }
    });
  }

  downloadTemplate(): void {
    const csvContent = 'Debit Account,Beneficiary Name,Beneficiary Account,IFSC,Amount,Purpose,Remarks\n123456789012,Test Beneficiary,987654321098,SBIN0001234,1000,Personal,Payment';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob); const link = document.createElement('a'); link.href=url; link.download='IMPS_Bulk_Upload_Template.csv'; link.click(); window.URL.revokeObjectURL(url);
  }
}
