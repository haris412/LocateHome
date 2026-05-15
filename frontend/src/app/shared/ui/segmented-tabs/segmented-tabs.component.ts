import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { NgStyle } from '@angular/common';

export interface SegmentedTabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-segmented-tabs',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './segmented-tabs.component.html',
  styleUrl: './segmented-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentedTabsComponent {
  readonly tabs = input<readonly SegmentedTabItem[]>([
    { id: 'signup', label: 'Sign up' },
    { id: 'login', label: 'Log in' }
  ]);
  readonly active = input.required<string>();
  readonly ariaLabel = input('Segmented tabs');
  readonly changed = output<string>();

  readonly visualActive = signal('signup');
  readonly isAnimating = signal(false);
  readonly activeIndex = computed(() => {
    const index = this.tabs().findIndex(tab => tab.id === this.visualActive());
    return index >= 0 ? index : 0;
  });
  readonly pillStyle = computed(() => {
    const count = Math.max(this.tabs().length, 1);
    return {
      width: `calc(${100 / count}% - 4px)`,
      transform: `translateX(${this.activeIndex() * 100}%)`
    };
  });

  private switchDelayMs = 120;
  private pendingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.visualActive.set(this.active());
  }

  ngOnChanges(): void {
    if (!this.isAnimating()) {
      this.visualActive.set(this.active());
    }
  }

  selectTab(next: string): void {
    if (next === this.active() || this.isAnimating()) {
      return;
    }

    if (this.pendingTimeoutId) {
      clearTimeout(this.pendingTimeoutId);
      this.pendingTimeoutId = null;
    }

    this.isAnimating.set(true);
    this.visualActive.set(next);

    this.pendingTimeoutId = setTimeout(() => {
      this.changed.emit(next);
      this.isAnimating.set(false);
      this.pendingTimeoutId = null;
    }, this.switchDelayMs);
  }
}
