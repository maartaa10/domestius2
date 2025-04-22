import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfegirPublicacioComponent } from './afegir-publicacio.component';

describe('AfegirPublicacioComponent', () => {
  let component: AfegirPublicacioComponent;
  let fixture: ComponentFixture<AfegirPublicacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfegirPublicacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfegirPublicacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
