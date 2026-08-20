import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OperationsService } from '../../../services/operations.service';
@Component({selector:'app-list',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./list.html',styleUrl:'./list.css'})
export class List implements OnInit { beneficiaries:any[]=[];search='';loading=false;errorMessage='';constructor(private operations:OperationsService){} ngOnInit(){this.load()} load(){this.loading=true;this.operations.getBeneficiaries().subscribe({next:r=>{this.loading=false;this.beneficiaries=r?.success?r.data||[]:[];this.errorMessage=r?.success?'':r?.message||'Unable to load beneficiaries.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load beneficiaries.'}})} get filtered(){const q=this.search.trim().toLowerCase();return this.beneficiaries.filter(b=>!q||[b.customer_name,b.account_number,b.ifsc_code,b.bank_name].some(v=>String(v||'').toLowerCase().includes(q)))} }
