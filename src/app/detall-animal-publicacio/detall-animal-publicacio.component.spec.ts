import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallAnimalPublicacioComponent } from './detall-animal-publicacio.component';

describe('DetallAnimalPublicacioComponent', () => {
  let component: DetallAnimalPublicacioComponent;
  let fixture: ComponentFixture<DetallAnimalPublicacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetallAnimalPublicacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallAnimalPublicacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
