import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalLlistaComponent } from './animal-llista.component';

describe('AnimalLlistaComponent', () => {
  let component: AnimalLlistaComponent;
  let fixture: ComponentFixture<AnimalLlistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimalLlistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalLlistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
