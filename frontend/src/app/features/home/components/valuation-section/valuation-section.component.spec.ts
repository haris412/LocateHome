import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuationSectionComponent } from './valuation-section.component';

describe('ValuationSectionComponent', () => {
  let component: ValuationSectionComponent;
  let fixture: ComponentFixture<ValuationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValuationSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValuationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
