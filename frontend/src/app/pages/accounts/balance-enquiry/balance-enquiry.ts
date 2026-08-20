import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';
import { VALIDATION } from '../../../utils/validation';
@Component({selector:'app-balance-enquiry',standalone:true,imports:[FormsModule],templateUrl:'./balance-enquiry.html',styleUrl:'./balance-enquiry.css'})
export class BalanceEnquiry{accountNumber='';account:any=null;errorMessage='';loading=false;constructor(private operations:OperationsService){}search(){this.errorMessage='';this.account=null;if(!VALIDATION.accountNumber.test(this.accountNumber.trim())){this.errorMessage='Enter a valid 9–18 digit account number.';return}this.loading=true;this.operations.getAccounts(this.accountNumber.trim()).subscribe({next:r=>{this.loading=false;this.account=r?.data?.[0]||null;if(!this.account)this.errorMessage='Account not found.'},error:e=>{this.loading=false;this.errorMessage=e?.error?.message||'Unable to load account.'}})}clear(){this.accountNumber='';this.account=null;this.errorMessage=''}}
