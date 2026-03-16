import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailShellComponent } from './listing-detail-shell.component';

describe('ListingDetailShellComponent', () => {
  let component: ListingDetailShellComponent;
  let fixture: ComponentFixture<ListingDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingDetailShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
