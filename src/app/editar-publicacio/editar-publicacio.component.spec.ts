import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPublicacioComponent } from './editar-publicacio.component';

describe('EditarPublicacioComponent', () => {
  let component: EditarPublicacioComponent;
  let fixture: ComponentFixture<EditarPublicacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarPublicacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPublicacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
