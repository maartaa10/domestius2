import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalPublicacioComponent } from './animal-publicacio.component';

describe('AnimalPublicacioComponent', () => {
  let component: AnimalPublicacioComponent;
  let fixture: ComponentFixture<AnimalPublicacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimalPublicacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalPublicacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
