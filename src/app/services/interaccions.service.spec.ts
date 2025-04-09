import { TestBed } from '@angular/core/testing';

import { InteraccionsService } from './interaccions.service';

describe('InteraccionsService', () => {
  let service: InteraccionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteraccionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
