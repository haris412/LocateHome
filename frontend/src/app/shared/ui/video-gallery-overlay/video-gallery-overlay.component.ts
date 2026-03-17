import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Output,
  effect,
  input,
  signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingVideoItem } from '../../../core/models/listing-detail.vm';

@Component({
  selector: 'app-video-gallery-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './video-gallery-overlay.component.html',
  styleUrl: './video-gallery-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoGalleryOverlayComponent {
  readonly videos = input.required<ListingVideoItem[]>();
  readonly startIndex = input(0);

  @Output() readonly close = new EventEmitter<void>();

  readonly currentIndex = signal(0);

  private touchStartX = 0;
  private touchEndX = 0;

  constructor() {
    effect(() => {
      this.currentIndex.set(this.startIndex());
      document.body.style.overflow = 'hidden';
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  get currentVideo(): ListingVideoItem | null {
    return this.videos()[this.currentIndex()] ?? null;
  }

  select(index: number): void {
    this.currentIndex.set(index);
  }

  next(): void {
    const items = this.videos();
    if (!items.length) return;
    this.currentIndex.update((index) => (index + 1) % items.length);
  }

  prev(): void {
    const items = this.videos();
    if (!items.length) return;
    this.currentIndex.update((index) => (index - 1 + items.length) % items.length);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('video-overlay')) {
      this.close.emit();
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? 0;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0]?.clientX ?? 0;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const delta = this.touchEndX - this.touchStartX;
    if (Math.abs(delta) < 50) return;

    if (delta < 0) {
      this.next();
    } else {
      this.prev();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  @HostListener('window:keydown.arrowright')
  onArrowRight(): void {
    this.next();
  }

  @HostListener('window:keydown.arrowleft')
  onArrowLeft(): void {
    this.prev();
  }
}