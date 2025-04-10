import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAnimalesComponent } from './mis-animales.component';

describe('MisAnimalesComponent', () => {
  let component: MisAnimalesComponent;
  let fixture: ComponentFixture<MisAnimalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisAnimalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisAnimalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
