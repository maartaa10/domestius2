import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarProtectoraComponent } from './registrar-protectora.component';

describe('RegistrarProtectoraComponent', () => {
  let component: RegistrarProtectoraComponent;
  let fixture: ComponentFixture<RegistrarProtectoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarProtectoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarProtectoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
