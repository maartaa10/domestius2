import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalPerdutComponent } from './animal-perdut.component';

describe('AnimalPerdutComponent', () => {
  let component: AnimalPerdutComponent;
  let fixture: ComponentFixture<AnimalPerdutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimalPerdutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalPerdutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
