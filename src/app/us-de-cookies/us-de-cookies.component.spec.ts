import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsDeCookiesComponent } from './us-de-cookies.component';

describe('UsDeCookiesComponent', () => {
  let component: UsDeCookiesComponent;
  let fixture: ComponentFixture<UsDeCookiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsDeCookiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsDeCookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
