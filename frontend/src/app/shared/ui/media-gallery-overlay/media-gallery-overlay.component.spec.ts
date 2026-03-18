import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaGalleryOverlayComponent } from './media-gallery-overlay.component';

describe('MediaGalleryOverlayComponent', () => {
  let component: MediaGalleryOverlayComponent;
  let fixture: ComponentFixture<MediaGalleryOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaGalleryOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaGalleryOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
