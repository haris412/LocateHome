import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPillComponent } from './stats-pill.component';

describe('StatsPillComponent', () => {
  let component: StatsPillComponent;
  let fixture: ComponentFixture<StatsPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsPillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
