import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementReports } from './settlement-reports';

describe('SettlementReports', () => {
  let component: SettlementReports;
  let fixture: ComponentFixture<SettlementReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementReports],
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
