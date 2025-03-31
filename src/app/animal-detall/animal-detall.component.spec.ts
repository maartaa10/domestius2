import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalDetallComponent } from './animal-detall.component';

describe('AnimalDetallComponent', () => {
  let component: AnimalDetallComponent;
  let fixture: ComponentFixture<AnimalDetallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimalDetallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalDetallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
