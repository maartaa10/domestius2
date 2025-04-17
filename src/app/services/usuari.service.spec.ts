import { TestBed } from '@angular/core/testing';

import { UsuariService } from './usuari.service';

describe('UsuariService', () => {
  let service: UsuariService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuariService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
