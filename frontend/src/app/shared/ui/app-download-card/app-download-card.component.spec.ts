import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDownloadCardComponent } from './app-download-card.component';

describe('AppDownloadCardComponent', () => {
  let component: AppDownloadCardComponent;
  let fixture: ComponentFixture<AppDownloadCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDownloadCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDownloadCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
