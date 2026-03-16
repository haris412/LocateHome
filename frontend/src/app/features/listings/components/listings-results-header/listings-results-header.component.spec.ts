import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingsResultsHeaderComponent } from './listings-results-header.component';

describe('ListingsResultsHeaderComponent', () => {
  let component: ListingsResultsHeaderComponent;
  let fixture: ComponentFixture<ListingsResultsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingsResultsHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingsResultsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
