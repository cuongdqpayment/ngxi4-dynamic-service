import { TestBed } from '@angular/core/testing';

import { Ngxi4CommonService } from './ngxi4-common.service';

describe('Ngxi4CommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Ngxi4CommonService = TestBed.get(Ngxi4CommonService);
    expect(service).toBeTruthy();
  });
});
