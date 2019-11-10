import { TestBed } from '@angular/core/testing';

import { Ngxi4AuthService } from './ngxi4-auth.service';

describe('Ngxi4AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Ngxi4AuthService = TestBed.get(Ngxi4AuthService);
    expect(service).toBeTruthy();
  });
});
