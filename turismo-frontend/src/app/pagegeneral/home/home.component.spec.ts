import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { of } from 'rxjs';
import { HomeService } from './home.service';
import { ThemeService } from '../../core/services/theme.service';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PaginatedResponse } from '../../core/services/admin.service';
import { Home, Municipalidad, Evento } from './home.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockHomeService: jasmine.SpyObj<HomeService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const paginatedStub: PaginatedResponse<Home> = {
    data: [],
    current_page: 1,
    first_page_url: 'http://test?page=1',
    from: 0,
    last_page: 1,
    last_page_url: 'http://test?page=1',
    next_page_url: null,
    path: 'http://test',
    per_page: 10,
    prev_page_url: null,
    to: 0,
    total: 0,
    links: [
      { url: null, label: '1', active: true }
    ]
  };

  // Muni stub bypass
  const muniStub = {} as unknown as Municipalidad;
  // Evento stub con fecha para la prueba de próximo evento
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const eventoStub = { fecha_inicio: futureDate, fecha_fin: futureDate } as unknown as Evento;

  beforeEach(async () => {
    mockHomeService = jasmine.createSpyObj('HomeService', [
      'getEmprendedores',
      'getReserva',
      'getCategorias',
      'getEmprendedor',
      'getMunicipalidad',
      'getEventos'
    ]);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['isDarkMode']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: HomeService, useValue: mockHomeService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    mockHomeService.getEmprendedores.and.returnValue(of(paginatedStub));
    mockHomeService.getReserva.and.returnValue(of([]));
    mockHomeService.getCategorias.and.returnValue(of({ success: true, data: [] }));
    mockHomeService.getMunicipalidad.and.returnValue(of(muniStub));
    mockHomeService.getEventos.and.returnValue(of({ data: { data: [eventoStub] } }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load emprendedores on init', () => {
    expect(mockHomeService.getEmprendedores).toHaveBeenCalled();
    expect(component.homes).toEqual([]);
  });

  it('should load municipalidad and set filteredSliders', () => {
    expect(mockHomeService.getMunicipalidad).toHaveBeenCalled();
    expect(component.municipalidad).toBe(muniStub);
  });

  it('should load eventos and find nearest', () => {
    component.cargarEventos();
    expect(mockHomeService.getEventos).toHaveBeenCalled();
    expect(component.eventos).toEqual([eventoStub]);
    expect(component.eventoMasCercano).toBe(eventoStub); // asegura que se asignó el stub
    expect(component.eventoMasCercano).toEqual(eventoStub);
  });

  it('should calculate duration correctly', () => {
    const dur = component.calcularDuracion('2024-01-01', '2024-01-08');
    expect(dur).toContain('1 semana');
  });

  it('should navigate via router', () => {
    component.navigateTo('/test');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
  });

  it('should toggle mostrarTodo and scroll', fakeAsync(() => {
    const div = document.createElement('div');
    spyOn(div, 'scrollIntoView');
    component.mostrarTodo = false;
    component.toggleMostrarTodo(div);
    tick(100);
    expect(component.mostrarTodo).toBeTrue();
    expect(div.scrollIntoView).toHaveBeenCalled();
  }));
});
