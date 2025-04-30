import { TestBed } from '@angular/core/testing';

import { PhotonService } from './photon.service';

describe('PhotonService', () => {
  let service: PhotonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
