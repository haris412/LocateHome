import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPromoSectionComponent } from './app-promo-section.component';

describe('AppPromoSectionComponent', () => {
  let component: AppPromoSectionComponent;
  let fixture: ComponentFixture<AppPromoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPromoSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPromoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
