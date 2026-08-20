import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Outbound } from './outbound';

describe('Outbound', () => {
  let component: Outbound;
  let fixture: ComponentFixture<Outbound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Outbound],
    }).compileComponents();

    fixture = TestBed.createComponent(Outbound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
