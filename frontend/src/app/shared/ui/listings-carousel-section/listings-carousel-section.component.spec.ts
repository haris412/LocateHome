import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingsCarouselSectionComponent } from './listings-carousel-section.component';

describe('ListingsCarouselSectionComponent', () => {
  let component: ListingsCarouselSectionComponent;
  let fixture: ComponentFixture<ListingsCarouselSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingsCarouselSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingsCarouselSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
