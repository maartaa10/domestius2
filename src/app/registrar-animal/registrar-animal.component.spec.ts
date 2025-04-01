import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarAnimalComponent } from './registrar-animal.component';

describe('RegistrarAnimalComponent', () => {
  let component: RegistrarAnimalComponent;
  let fixture: ComponentFixture<RegistrarAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
