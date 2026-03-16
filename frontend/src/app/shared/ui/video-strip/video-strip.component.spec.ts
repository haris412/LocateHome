import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoStripComponent } from './video-strip.component';

describe('VideoStripComponent', () => {
  let component: VideoStripComponent;
  let fixture: ComponentFixture<VideoStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoStripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
