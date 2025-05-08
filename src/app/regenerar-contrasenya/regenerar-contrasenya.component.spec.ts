import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegenerarContrasenyaComponent } from './regenerar-contrasenya.component';

describe('RegenerarContrasenyaComponent', () => {
  let component: RegenerarContrasenyaComponent;
  let fixture: ComponentFixture<RegenerarContrasenyaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegenerarContrasenyaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegenerarContrasenyaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
