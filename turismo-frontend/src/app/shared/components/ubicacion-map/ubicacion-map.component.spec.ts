// ubicacion-map.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UbicacionMapComponent } from './ubicacion-map.component';
import { By } from '@angular/platform-browser';

describe('UbicacionMapComponent', () => {
  let component: UbicacionMapComponent;
  let fixture: ComponentFixture<UbicacionMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbicacionMapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UbicacionMapComponent);
    component = fixture.componentInstance;
  });

  it('updateRadius changes radius and calls circle update', () => {
    spyOn<any>(component, 'updateRadiusCircle');
    component.showRadiusIndicator = true;
    component.updateRadius(8);
    expect(component.radiusKm).toBe(8);
    expect((component as any).updateRadiusCircle).toHaveBeenCalled();
  });

  it('clearMap removes marker and circle', () => {
    const fakeMap = jasmine.createSpyObj('map', ['removeLayer']);
    component['map'] = fakeMap;
    component['marker'] = {};
    component['radiusCircle'] = {};

    component.clearMap();
    expect(fakeMap.removeLayer).toHaveBeenCalledTimes(2);
    expect(component['marker']).toBeNull();
    expect(component['radiusCircle']).toBeNull();
  });

  it('centerOnCapachica sets view with correct coords', () => {
    const fakeMap = jasmine.createSpyObj('map', ['setView']);
    component['map'] = fakeMap;
    component.centerOnCapachica();
    expect(fakeMap.setView).toHaveBeenCalledWith([-15.6428, -69.8334], 12);
  });
});
