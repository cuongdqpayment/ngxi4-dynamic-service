import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDynamicFormComponent } from './card-dynamic-form.component';

describe('CardDynamicFormComponent', () => {
  let component: CardDynamicFormComponent;
  let fixture: ComponentFixture<CardDynamicFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardDynamicFormComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
