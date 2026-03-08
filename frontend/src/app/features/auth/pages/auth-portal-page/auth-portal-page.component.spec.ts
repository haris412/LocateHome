import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPortalPageComponent } from './auth-portal-page.component';

describe('AuthPortalPageComponent', () => {
  let component: AuthPortalPageComponent;
  let fixture: ComponentFixture<AuthPortalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthPortalPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthPortalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
