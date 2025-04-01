import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicacioDetallComponent } from './publicacio-detall.component';

describe('PublicacioDetallComponent', () => {
  let component: PublicacioDetallComponent;
  let fixture: ComponentFixture<PublicacioDetallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicacioDetallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicacioDetallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
