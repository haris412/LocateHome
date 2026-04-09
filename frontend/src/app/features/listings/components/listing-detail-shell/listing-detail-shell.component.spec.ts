import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailShellComponent } from './listing-detail-shell.component';
import { PROPERTY_DETAIL_MOCK } from '../../data/listing-detail.mock';

describe('ListingDetailShellComponent', () => {
  let component: ListingDetailShellComponent;
  let fixture: ComponentFixture<ListingDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingDetailShellComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingDetailShellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('vm', PROPERTY_DETAIL_MOCK);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
