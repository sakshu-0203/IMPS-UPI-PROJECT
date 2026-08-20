import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTransfer } from './new-transfer';

describe('NewTransfer', () => {
  let component: NewTransfer;
  let fixture: ComponentFixture<NewTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(NewTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
