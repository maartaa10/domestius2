import { TestBed } from '@angular/core/testing';

import { AnimalPerdutService } from './animal-perdut.service';

describe('AnimalPerdutService', () => {
  let service: AnimalPerdutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimalPerdutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
