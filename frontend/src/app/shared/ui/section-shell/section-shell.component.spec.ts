import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionShellComponent } from './section-shell.component';

describe('SectionShellComponent', () => {
  let component: SectionShellComponent;
  let fixture: ComponentFixture<SectionShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
