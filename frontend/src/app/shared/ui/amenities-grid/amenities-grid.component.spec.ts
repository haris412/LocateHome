import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenitiesGridComponent } from './amenities-grid.component';

describe('AmenitiesGridComponent', () => {
  let component: AmenitiesGridComponent;
  let fixture: ComponentFixture<AmenitiesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenitiesGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmenitiesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
