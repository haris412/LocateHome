import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface HeaderNavItem {
  id: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly mobileMenuOpen = signal(false);

  readonly navItems: readonly HeaderNavItem[] = [
    { id: 'buy', label: 'Buy', route: '/buy' },
    { id: 'sell', label: 'Sell', route: '/sell' },
    { id: 'rent', label: 'Rent', route: '/rent' },
    { id: 'agents', label: 'Find Agents', route: '/agents' },
    { id: 'about', label: 'About', route: '/about' }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}