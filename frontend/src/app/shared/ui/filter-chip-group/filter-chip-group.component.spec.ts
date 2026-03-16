import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChipGroupComponent } from './filter-chip-group.component';

describe('FilterChipGroupComponent', () => {
  let component: FilterChipGroupComponent;
  let fixture: ComponentFixture<FilterChipGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterChipGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterChipGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
