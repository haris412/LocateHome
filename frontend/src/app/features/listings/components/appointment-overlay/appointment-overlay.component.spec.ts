import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AppointmentOverlayComponent } from './appointment-overlay.component';
import { AppointmentOverlayData } from '../../../../core/models/appointment.models';

describe('AppointmentOverlayComponent', () => {
  let component: AppointmentOverlayComponent;
  let fixture: ComponentFixture<AppointmentOverlayComponent>;

  const mockData: AppointmentOverlayData = {
    agentName: 'Test Agent',
    listing: {
      propertyId: 'listing-1',
      imageUrl: '',
      price: '$1',
      address: '1 Main St'
    },
    dateSlots: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentOverlayComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentOverlayComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
