import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ListingDetailPageComponent } from './listing-detail-page.component';
import { ListingsApiProperty } from '../../../../core/models/listing.models';

describe('ListingDetailPageComponent', () => {
  let component: ListingDetailPageComponent;
  let fixture: ComponentFixture<ListingDetailPageComponent>;
  let httpMock: HttpTestingController;
  const paramMap$ = new BehaviorSubject(
    convertToParamMap({ id: 'prop-detail-test-id' })
  );

  const sampleApiProperty: ListingsApiProperty = {
    _id: 'prop-detail-test-id',
    purpose: 'For Rent',
    propertyType: 'Apartment',
    listingTitle: 'Test listing',
    propertyDescription: 'A fine home.',
    price: 2800,
    areaSize: 1100,
    areaUnit: 'sqft',
    numBedrooms: 2,
    numBathrooms: 2,
    images: [{ url: 'https://example.com/img.jpg', orderIndex: 0, isThumbnail: true }],
    city: 'Seattle',
    fullAddress: '123 Main St, Seattle, WA',
    contactName: 'Agent Smith',
    contactEmail: 'agent@example.com',
    contactPhoneNumber: '+10005550001',
    userId: 'owner-id-1',
    status: 'Published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingDetailPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingDetailPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const req = httpMock.expectOne(r =>
      r.url.endsWith('/api/properties/prop-detail-test-id')
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { property: sampleApiProperty } });
    fixture.detectChanges();
    expect(component.detail()?.id).toBe('prop-detail-test-id');
    expect(component.detail()?.agent.userId).toBe('owner-id-1');
    httpMock.verify();
  });
});
