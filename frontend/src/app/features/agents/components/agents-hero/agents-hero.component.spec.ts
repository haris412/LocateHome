import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsHeroComponent } from './agents-hero.component';

describe('AgentsHeroComponent', () => {
  let component: AgentsHeroComponent;
  let fixture: ComponentFixture<AgentsHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
