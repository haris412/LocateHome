import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type PageToken = number | '…';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  readonly page = input.required<number>();        // 1-based
  readonly pageCount = input.required<number>();   // total pages (>= 1)
  readonly ariaLabel = input<string>('Pagination');

  readonly pageChange = output<number>();

  readonly safePage = computed(() => clamp(this.page(), 1, Math.max(1, this.pageCount())));
  readonly safeCount = computed(() => Math.max(1, this.pageCount()));

  readonly canPrev = computed(() => this.safePage() > 1);
  readonly canNext = computed(() => this.safePage() < this.safeCount());

  readonly tokens = computed<PageToken[]>(() => {
    const current = this.safePage();
    const total = this.safeCount();

    // small totals: show all pages
    if (total <= 7) return range(1, total);

    // window around current + first/last
    const windowStart = Math.max(2, current - 1);
    const windowEnd = Math.min(total - 1, current + 1);

    const out: PageToken[] = [1];

    if (windowStart > 2) out.push('…');

    for (let p = windowStart; p <= windowEnd; p++) out.push(p);

    if (windowEnd < total - 1) out.push('…');

    out.push(total);
    return out;
  });

  goTo(target: number) {
    const next = clamp(target, 1, this.safeCount());
    if (next !== this.safePage()) this.pageChange.emit(next);
  }

  prev() {
    if (this.canPrev()) this.goTo(this.safePage() - 1);
  }

  next() {
    if (this.canNext()) this.goTo(this.safePage() + 1);
  }

  isActive(token: PageToken): boolean {
    return typeof token === 'number' && token === this.safePage();
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}