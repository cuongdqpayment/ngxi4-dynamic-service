import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMultiCheckComponent } from './card-multi-check.component';

describe('CardMultiCheckComponent', () => {
  let component: CardMultiCheckComponent;
  let fixture: ComponentFixture<CardMultiCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardMultiCheckComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardMultiCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
