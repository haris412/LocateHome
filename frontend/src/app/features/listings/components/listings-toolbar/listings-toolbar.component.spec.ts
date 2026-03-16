import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingsToolbarComponent } from './listings-toolbar.component';

describe('ListingsToolbarComponent', () => {
  let component: ListingsToolbarComponent;
  let fixture: ComponentFixture<ListingsToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingsToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
