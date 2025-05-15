import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueFerAnimalPerdutComponent } from './que-fer-animal-perdut.component';

describe('QueFerAnimalPerdutComponent', () => {
  let component: QueFerAnimalPerdutComponent;
  let fixture: ComponentFixture<QueFerAnimalPerdutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueFerAnimalPerdutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueFerAnimalPerdutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
