import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectoraDetallComponent } from './protectora-detall.component';

describe('ProtectoraDetallComponent', () => {
  let component: ProtectoraDetallComponent;
  let fixture: ComponentFixture<ProtectoraDetallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProtectoraDetallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtectoraDetallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
