import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceEnquiry } from './balance-enquiry';

describe('BalanceEnquiry', () => {
  let component: BalanceEnquiry;
  let fixture: ComponentFixture<BalanceEnquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceEnquiry],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceEnquiry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track selected account count and modal payload', () => {
    const first = { account_number: '123456789012', customer_name: 'Test Customer', balance: 125000, account_type: 'Savings', branch_code: 'BR001', status: 'ACTIVE' };
    const second = { account_number: '123456789013', customer_name: 'Rahul Patil', balance: 250000, account_type: 'Current', branch_code: 'BR002', status: 'ACTIVE' };

    component.toggleAccountSelection(first);
    expect(component.selectedAccountCount).toBe(1);

    component.toggleAccountSelection(second);
    expect(component.selectedAccountCount).toBe(2);

    component.openBalanceModal();
    expect(component.balanceModalAccounts.length).toBe(2);
    expect(component.balanceModalAccounts[0].account_number).toBe('123456789012');
  });
});
