import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ngxi4CardDynamicFormComponent } from './ngxi4-card-dynamic-form.component';

describe('Ngxi4CardDynamicFormComponent', () => {
  let component: Ngxi4CardDynamicFormComponent;
  let fixture: ComponentFixture<Ngxi4CardDynamicFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ngxi4CardDynamicFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ngxi4CardDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
