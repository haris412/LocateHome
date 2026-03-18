import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-media-gallery-overlay',
  standalone: true,
  templateUrl: './media-gallery-overlay.component.html',
  styleUrl: './media-gallery-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class MediaGalleryOverlayComponent {
  readonly images = input.required<string[]>();
  readonly startIndex = input(0);

  @Output() readonly close = new EventEmitter<void>();

  currentIndex = 0;

  ngOnInit() {
    this.currentIndex = this.startIndex();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images().length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images().length) %
      this.images().length;
  }

  select(index: number) {
    this.currentIndex = index;
  }
}