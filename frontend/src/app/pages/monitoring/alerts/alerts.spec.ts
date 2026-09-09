import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Alerts } from './alerts';
import { OperationsService } from '../../../services/operations.service';

describe('Alerts', () => {
  let component: Alerts;
  let fixture: ComponentFixture<Alerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alerts],
      providers: [
        {
          provide: OperationsService,
          useValue: { getAlerts: () => of({ success: true, data: [] }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Alerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
