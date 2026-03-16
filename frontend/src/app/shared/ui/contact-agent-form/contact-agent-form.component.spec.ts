import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAgentFormComponent } from './contact-agent-form.component';

describe('ContactAgentFormComponent', () => {
  let component: ContactAgentFormComponent;
  let fixture: ComponentFixture<ContactAgentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAgentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactAgentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
