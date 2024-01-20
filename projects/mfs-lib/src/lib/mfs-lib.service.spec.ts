import { TestBed } from '@angular/core/testing';

import { MfsLibService } from './mfs-lib.service';

describe('MfsLibService', () => {
  let service: MfsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MfsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
