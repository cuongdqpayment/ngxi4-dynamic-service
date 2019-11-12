import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiChoiceComponent } from './multi-choice.component';

describe('MultiChoiceComponent', () => {
  let component: MultiChoiceComponent;
  let fixture: ComponentFixture<MultiChoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiChoiceComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
