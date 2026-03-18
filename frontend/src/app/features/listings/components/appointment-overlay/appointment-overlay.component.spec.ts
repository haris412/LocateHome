import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentOverlayComponent } from './appointment-overlay.component';

describe('AppointmentOverlayComponent', () => {
  let component: AppointmentOverlayComponent;
  let fixture: ComponentFixture<AppointmentOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
