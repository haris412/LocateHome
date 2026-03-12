import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsSectionComponent } from './agents-section.component';

describe('AgentsSectionComponent', () => {
  let component: AgentsSectionComponent;
  let fixture: ComponentFixture<AgentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
