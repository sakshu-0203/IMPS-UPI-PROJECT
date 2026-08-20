import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiLogs } from './api-logs';

describe('ApiLogs', () => {
  let component: ApiLogs;
  let fixture: ComponentFixture<ApiLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiLogs],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
