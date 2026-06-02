import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PropertyDetailViewModel } from '../models/property-detail.vm';

interface PropertyShareData {
  id:          string;
  title:       string;
  address:     string;
  price:       string;
  purpose:     string;
  priceSuffix?: string;
  beds?:       string;
  baths?:      string;
  area?:       string;
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly document   = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  sharePropertyOnWhatsApp(detail: PropertyDetailViewModel): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const stat = (label: string) =>
      detail.stats.find((s) => s.label === label)?.value ?? '';

    const data: PropertyShareData = {
      id:          detail.id,
      title:       detail.listingTitle,
      address:     detail.addressLine,
      price:       detail.price,
      purpose:     detail.purpose,
      priceSuffix: detail.priceSuffix,
      beds:        stat('Bedrooms'),
      baths:       stat('Bathrooms'),
      area:        stat('Living area')
    };

    const url     = this.buildPropertyUrl(data.id);
    const message = this.buildWhatsAppMessage(data, url);

    this.document.defaultView?.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  buildPropertyUrl(id: string): string {
    return `${environment.siteUrl}/listings/${id}`;
  }

  private buildWhatsAppMessage(data: PropertyShareData, url: string): string {
    const price = data.priceSuffix
      ? `${data.price} ${data.priceSuffix}`
      : data.price;

    const specs = [
      data.beds  ? `🛏️ ${data.beds} Beds`   : null,
      data.baths ? `🚿 ${data.baths} Baths`  : null,
      data.area  ? `📐 ${data.area}`          : null
    ].filter(Boolean).join('  •  ');

    const lines = [
      `🏠 *${data.title}*`,
      `📍 ${data.address}`,
      `🏷️ ${data.purpose}  •  💰 ${price}`,
    ];

    if (specs) lines.push(``, specs);

    lines.push(``, `View on LocateHome 👇`, url);

    return lines.join('\n');
  }
}
