import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ionic4CroppieComponent } from './ionic4-croppie.component';

describe('Ionic4CroppieComponent', () => {
  let component: Ionic4CroppieComponent;
  let fixture: ComponentFixture<Ionic4CroppieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ionic4CroppieComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ionic4CroppieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
