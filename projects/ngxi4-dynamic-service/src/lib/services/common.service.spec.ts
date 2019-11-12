import { TestBed } from '@angular/core/testing';

import { CommonsService } from './common.service';

describe('Ngxi4CommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CommonsService = TestBed.get(CommonsService);
    expect(service).toBeTruthy();
  });
});
