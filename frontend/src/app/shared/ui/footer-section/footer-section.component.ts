import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  queryParams?: Params;
}

@Component({
  selector: 'app-footer-section',
  templateUrl: './footer-section.component.html',
  styleUrl: './footer-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class FooterSectionComponent {
  readonly footerGroups = signal<FooterLinkGroup[]>([
    {
      id: '1',
      title: 'Explore',
      links: [
        { id: 'a', label: 'Homes for sale', href: '/listings', queryParams: { purpose: 'For Sale', page: 1 } },
        { id: 'b', label: 'Homes for rent', href: '/listings', queryParams: { purpose: 'For Rent', page: 1 } },
        { id: 'c', label: 'New projects', href: '/home' },
        { id: 'd', label: 'Commercial', href: '/home' },
        { id: 'e', label: 'Agents', href: '/agents' },
        { id: 'f', label: 'Properties', href: '/listings' }
      ]
    },
    {
      id: '2',
      title: 'Company',
      links: [
        { id: 'a', label: 'About us', href: '/home' },
        { id: 'b', label: 'Careers', href: '/home' },
        { id: 'c', label: 'Our team', href: '/home' },
        { id: 'd', label: 'Press', href: '/home' },
        { id: 'e', label: 'Contact us', href: '/home' }
      ]
    },
    {
      id: '3',
      title: 'Support',
      links: [
        { id: 'a', label: 'Help center', href: '/home' },
        { id: 'b', label: 'Guides & resources', href: '/home' },
        { id: 'c', label: 'Contact Us', href: '/contact' },
        { id: 'd', label: 'Report an issue', href: '/home' }
      ]
    },
    {
      id: '4',
      title: 'Legal',
      links: [
        { id: 'a', label: 'Privacy policy', href: '/privacy-policy' },
        { id: 'b', label: 'Terms of service', href: '/home' },
        { id: 'c', label: 'Cookies policy', href: '/home' },
        { id: 'd', label: 'Disclaimer', href: '/home' }
      ]
    }
  ]);

  readonly secondaryLinks = signal<FooterLink[]>([
    { id: 'privacy', label: 'Privacy', href: '/privacy-policy' },
    { id: 'terms', label: 'Terms', href: '/home' },
    { id: 'sitemap', label: 'Sitemap', href: '/home' }
  ]);
}
