import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsFiltersComponent } from './agents-filters.component';

describe('AgentsFiltersComponent', () => {
  let component: AgentsFiltersComponent;
  let fixture: ComponentFixture<AgentsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
