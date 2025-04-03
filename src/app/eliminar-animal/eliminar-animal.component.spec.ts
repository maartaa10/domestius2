import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarAnimalComponent } from './eliminar-animal.component';

describe('EliminarAnimalComponent', () => {
  let component: EliminarAnimalComponent;
  let fixture: ComponentFixture<EliminarAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EliminarAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
