import { TestBed } from '@angular/core/testing';

import { ApiStorageService } from './api-storage.service';

describe('ApiStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiStorageService = TestBed.get(ApiStorageService);
    expect(service).toBeTruthy();
  });
});
