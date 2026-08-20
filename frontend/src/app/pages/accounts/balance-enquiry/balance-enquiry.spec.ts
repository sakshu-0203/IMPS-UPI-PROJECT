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
});
