import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import{RouterLink} from '@angular/router';

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
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
        { id: 'a', label: 'Homes for sale', href: '/listings' },
        { id: 'b', label: 'Homes for rent', href: '/listings' },
        { id: 'c', label: 'Luxury homes', href: '/listings' }
      ]
    },
    {
      id: '2',
      title: 'Company',
      links: [
        { id: 'a', label: 'About us', href: '/home' },
        { id: 'b', label: 'Careers', href: '/home' },
        { id: 'c', label: 'Press', href: '/home' }
      ]
    },
    {
      id: '3',
      title: 'Support',
      links: [
        { id: 'a', label: 'Help center', href: '/home' },
        { id: 'b', label: 'Privacy policy', href: '/home' },
        { id: 'c', label: 'Terms', href: '/home' }
      ]
    }
  ]);
}