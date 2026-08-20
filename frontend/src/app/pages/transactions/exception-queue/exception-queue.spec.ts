import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionQueue } from './exception-queue';

describe('ExceptionQueue', () => {
  let component: ExceptionQueue;
  let fixture: ComponentFixture<ExceptionQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExceptionQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(ExceptionQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
