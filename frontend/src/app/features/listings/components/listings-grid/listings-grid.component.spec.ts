import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingsGridComponent } from './listings-grid.component';

describe('ListingsGridComponent', () => {
  let component: ListingsGridComponent;
  let fixture: ComponentFixture<ListingsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
