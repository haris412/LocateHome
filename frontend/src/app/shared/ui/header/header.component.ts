import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink, Params } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CdkAutofill } from "@angular/cdk/text-field";

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
  constructor(private router: Router) {}

  readonly navItems: readonly HeaderNavItem[] = [
    { id: 'buy', label: 'Buy', route: '/listings'},
    { id: 'sell', label: 'Sell', route: '/listings/sell'},
    { id: 'rent', label: 'Rent', route: '/listings'},
    { id: 'agents', label: 'Find Agents', route: '/home' },
    { id: 'about', label: 'About', route: '/home' }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  onNavClick(item: HeaderNavItem): void {
  this.router.navigate([item.route], { queryParams: item. queryParams });
}
}
