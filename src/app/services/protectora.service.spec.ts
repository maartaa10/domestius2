import { TestBed } from '@angular/core/testing';

import { ProtectoraService } from './protectora.service';

describe('ProtectoraService', () => {
  let service: ProtectoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtectoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
