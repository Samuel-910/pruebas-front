import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

import { EventosdetalleComponent } from './eventosdetalle.component';
import { EventosService, Slider, Evento } from '../evento.service';

describe('EventosdetalleComponent', () => {
  let component: EventosdetalleComponent;
  let fixture: ComponentFixture<EventosdetalleComponent>;
  let eventosServiceSpy: jasmine.SpyObj<EventosService>;
  let router: Router;
  let routerSpy: jasmine.Spy;

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '42' }) }
  };

  beforeEach(async () => {
    eventosServiceSpy = jasmine.createSpyObj('EventosService', ['obtenerEvento', 'getEventoById']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        HttpClientTestingModule,
        EventosdetalleComponent  // standalone component
      ],
      providers: [
        { provide: EventosService, useValue: eventosServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventosdetalleComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load evento on success', () => {
    const mockData: Evento = {
      id: 42,
      nombre: 'Test Evento',
      descripcion: 'Descripción',
      fecha: '2025-01-01',
      tipo_evento: 'Tipo',
      sliders: []
    } as any;
    eventosServiceSpy.obtenerEvento.and.returnValue(of({ success: true, data: mockData } as any));

    component.ngOnInit();

    expect(eventosServiceSpy.obtenerEvento).toHaveBeenCalledWith(42);
    expect(component.evento).toEqual(mockData);
  });

    it('cargarDetalleEvento should set evento and loading flags on success', fakeAsync(() => {
    const mockEvento: Evento = ({
      id: 1,
      nombre: 'A',
      descripcion: 'B',
      fecha: '2025-02-02',
      tipo_evento: 'C',
      sliders: []
    } as any);
    eventosServiceSpy.getEventoById.and.returnValue(of(mockEvento));

    component.isLoading = false;
    component.cargarDetalleEvento(1);
    tick(); // esperar la respuesta

    expect(component.evento).toEqual(mockEvento);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
  }));

  it('cargarDetalleEvento should set errorMessage on error', fakeAsync(() => {
    eventosServiceSpy.getEventoById.and.returnValue(throwError(() => new Error('fail')));

    component.cargarDetalleEvento(2);
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Error al cargar el evento.');
  }));

  it('getSliderUrlPorOrden should return correct url or default', () => {
    component.evento = {
      sliders: [
        { orden: 1, url_completa: 'url1' },
        { orden: 2, url_completa: 'url2' }
      ] as any
    } as any;

    expect(component.getSliderUrlPorOrden(1)).toBe('url1');
    expect(component.getSliderUrlPorOrden(3)).toBe('ruta/por/defecto.jpg');
  });

  it('imagenesSecundarias should filter sliders with orden > 1', () => {
    component.evento = {
      sliders: [
        { orden: 1, url_completa: 'url1' },
        { orden: 2, url_completa: 'url2' },
        { orden: 3, url_completa: 'url3' }
      ] as any
    } as any;

    const result = component.imagenesSecundarias;
    expect(result.length).toBe(2);
    expect(result).toEqual([
      { orden: 2, url_completa: 'url2' },
      { orden: 3, url_completa: 'url3' }
    ] as any);
  });

  it('regresarAListado should navigate to /eventos', () => {
    component.regresarAListado();
    expect(routerSpy).toHaveBeenCalledWith(['/eventos']);
  });
});
