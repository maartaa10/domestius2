import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaAnimalsPerdutsComponent } from './mapa-animals-perduts.component';

describe('MapaAnimalsPerdutsComponent', () => {
  let component: MapaAnimalsPerdutsComponent;
  let fixture: ComponentFixture<MapaAnimalsPerdutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapaAnimalsPerdutsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaAnimalsPerdutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
