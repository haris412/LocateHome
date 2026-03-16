import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSelectCardComponent } from './filter-select-card.component';

describe('FilterSelectCardComponent', () => {
  let component: FilterSelectCardComponent;
  let fixture: ComponentFixture<FilterSelectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSelectCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterSelectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
