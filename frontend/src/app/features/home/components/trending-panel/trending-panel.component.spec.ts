import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingPanelComponent } from './trending-panel.component';

describe('TrendingPanelComponent', () => {
  let component: TrendingPanelComponent;
  let fixture: ComponentFixture<TrendingPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
