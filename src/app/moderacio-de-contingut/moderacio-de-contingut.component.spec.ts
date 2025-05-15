import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeracioDeContingutComponent } from './moderacio-de-contingut.component';

describe('ModeracioDeContingutComponent', () => {
  let component: ModeracioDeContingutComponent;
  let fixture: ComponentFixture<ModeracioDeContingutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModeracioDeContingutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeracioDeContingutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
