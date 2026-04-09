import { Routes } from '@angular/router';
import { ListingsPageComponent } from './pages/listings-page/listings-page.component';
import { ListingDetailPageComponent } from './pages/listing-detail-page/listing-detail-page.component';

export const LISTINGS_ROUTES: Routes = [
  {
    path: '',
    component: ListingsPageComponent
  },
  {
    path: 'sell',
    component: ListingsPageComponent
  },
  {
    path: ':id',
    component: ListingDetailPageComponent
  }
];