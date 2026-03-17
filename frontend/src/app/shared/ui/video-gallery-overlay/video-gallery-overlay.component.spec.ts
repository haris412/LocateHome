import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoGalleryOverlayComponent } from './video-gallery-overlay.component';

describe('VideoGalleryOverlayComponent', () => {
  let component: VideoGalleryOverlayComponent;
  let fixture: ComponentFixture<VideoGalleryOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoGalleryOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoGalleryOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
