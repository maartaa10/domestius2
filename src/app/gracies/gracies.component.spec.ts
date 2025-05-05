import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraciesComponent } from './gracies.component';

describe('GraciesComponent', () => {
  let component: GraciesComponent;
  let fixture: ComponentFixture<GraciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
