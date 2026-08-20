import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reversal } from './reversal';

describe('Reversal', () => {
  let component: Reversal;
  let fixture: ComponentFixture<Reversal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reversal],
    }).compileComponents();

    fixture = TestBed.createComponent(Reversal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
