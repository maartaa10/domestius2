import { TestBed } from '@angular/core/testing';

import { PublicacioService } from './publicacio.service';

describe('PublicacioService', () => {
  let service: PublicacioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicacioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
