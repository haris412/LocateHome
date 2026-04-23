import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, Params, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CdkAutofill } from '@angular/cdk/text-field';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface HeaderNavItem {
  id: string;
  label: string;
  route: string;
  queryParams?: Params;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule, CdkAutofill],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly mobileMenuOpen = signal(false);
  private readonly router = inject(Router);

  readonly navItems: readonly HeaderNavItem[] = [
    { id: 'home', label: 'Home', route: '/home' },
    { id: 'buy', label: 'Buy', route: '/listings' },
    { id: 'rent', label: 'Rent', route: '/listings' },
    { id: 'agents', label: 'Find Agents', route: '/agents' }
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ),
    { initialValue: null }
  );

  readonly activeUrl = computed(() => {
    this.currentUrl();
    return this.router.url;
  });

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onNavClick(item: HeaderNavItem): void {
    this.router.navigate([item.route], { queryParams: item.queryParams });
  }

  isActive(item: HeaderNavItem): boolean {
    const url = this.activeUrl();

    if (item.id === 'home') {
      return url === '/home' || url === '/';
    }

    if (item.id === 'buy') {
      return url.startsWith('/listings') && !this.isRentUrl(url);
    }

    if (item.id === 'rent') {
      return url.startsWith('/listings') && this.isRentUrl(url);
    }

    if (item.id === 'agents') {
      return url.startsWith('/agents');
    }

    return url.startsWith(item.route);
  }

  private isRentUrl(url: string): boolean {
    return url.includes('purpose=rent') || url.includes('/rent');
  }
}