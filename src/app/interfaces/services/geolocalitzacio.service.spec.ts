import { TestBed } from '@angular/core/testing';

import { GeolocalitzacioService } from './geolocalitzacio.service';

describe('GeolocalitzacioService', () => {
  let service: GeolocalitzacioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocalitzacioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
