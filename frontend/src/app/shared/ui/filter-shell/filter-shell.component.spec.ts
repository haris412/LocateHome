import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterShellComponent } from './filter-shell.component';

describe('FilterShellComponent', () => {
  let component: FilterShellComponent;
  let fixture: ComponentFixture<FilterShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
