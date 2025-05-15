import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebgrafiaComponent } from './webgrafia.component';

describe('WebgrafiaComponent', () => {
  let component: WebgrafiaComponent;
  let fixture: ComponentFixture<WebgrafiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebgrafiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebgrafiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
