import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSegmentTabsComponent } from './filter-segment-tabs.component';

describe('FilterSegmentTabsComponent', () => {
  let component: FilterSegmentTabsComponent;
  let fixture: ComponentFixture<FilterSegmentTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSegmentTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterSegmentTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
