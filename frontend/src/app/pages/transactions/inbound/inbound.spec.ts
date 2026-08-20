import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inbound } from './inbound';

describe('Inbound', () => {
  let component: Inbound;
  let fixture: ComponentFixture<Inbound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inbound],
    }).compileComponents();

    fixture = TestBed.createComponent(Inbound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
