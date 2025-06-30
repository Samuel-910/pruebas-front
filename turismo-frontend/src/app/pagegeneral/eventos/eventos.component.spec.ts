import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EventosComponent } from './eventos.component';
import { EventosService } from './evento.service';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EventosComponent', () => {
  let component: EventosComponent;
  let fixture: ComponentFixture<EventosComponent>;
  let mockEventosService: jasmine.SpyObj<EventosService>;

  const mockEventos: any[] = [
    {
      id: 1,
      nombre: 'Evento Test 1',
      descripcion: 'Descripción del evento 1',
      fecha_inicio: '2024-12-25',
      fecha_fin: '2024-12-25',
      hora_inicio: '09:00',
      hora_fin: '17:00',
      lugar: 'Lugar Test 1',
      tipo_evento: 'Conferencia',
      sliders: [{ url_completa: 'http://example.com/image1.jpg' }],
      sliders_principales: [{ url_completa: 'http://example.com/image1.jpg' }]
    },
    {
      id: 2,
      nombre: 'Evento Test 2',
      descripcion: 'Descripción del evento 2',
      fecha_inicio: '2024-12-30',
      fecha_fin: '2024-12-30',
      hora_inicio: '10:00',
      hora_fin: '18:00',
      lugar: 'Lugar Test 2',
      tipo_evento: 'Taller',
      sliders: [{ url_completa: 'http://example.com/image2.jpg' }],
      sliders_principales: [{ url_completa: 'http://example.com/image2.jpg' }]
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EventosService', ['getEventos', 'getProximosEventos']);

    await TestBed.configureTestingModule({
      imports: [
        EventosComponent,
        CommonModule,
        FormsModule,
        CalendarModule.forRoot({
          provide: DateAdapter,
          useFactory: adapterFactory
        }),
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: EventosService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventosComponent);
    component = fixture.componentInstance;
    mockEventosService = TestBed.inject(EventosService) as jasmine.SpyObj<EventosService>;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      mockEventosService.getEventos.and.returnValue(of([]));
      mockEventosService.getProximosEventos.and.returnValue(of({ success: true, data: [] }));

      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      mockEventosService.getEventos.and.returnValue(of([]));
      mockEventosService.getProximosEventos.and.returnValue(of({ success: true, data: [] }));

      expect(component.eventos).toEqual([]);
      expect(component.filtroAnio).toBe('todos');
      expect(component.filtroMes).toBe('proximos');
      expect(component.filtroTipo).toBe('todos');
      expect(component.mostrarModalCalendario).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should call required methods on init', () => {
      spyOn(component, 'cargarEventos');
      spyOn(component, 'cargarEventoCercano');
      spyOn(component, 'obtenerEventoMasProximo');

      component.ngOnInit();

      expect(component.cargarEventos).toHaveBeenCalled();
      expect(component.cargarEventoCercano).toHaveBeenCalled();
      expect(component.obtenerEventoMasProximo).toHaveBeenCalled();
    });
  });

  describe('cargarEventos', () => {
    it('should load events successfully', () => {
      mockEventosService.getEventos.and.returnValue(of(mockEventos));
      spyOn(component, 'actualizarCalendario');

      component.cargarEventos();

      expect(component.eventos).toEqual(mockEventos);
      expect(component.eventoDestacado).toEqual(mockEventos[0]);
      expect(component.actualizarCalendario).toHaveBeenCalled();
    });

    it('should handle empty events', () => {
      mockEventosService.getEventos.and.returnValue(of([]));
      spyOn(component, 'actualizarCalendario');

      component.cargarEventos();

      expect(component.eventos).toEqual([]);
      expect(component.eventoDestacado).toBeUndefined();
      expect(component.actualizarCalendario).toHaveBeenCalled();
    });
  });

  describe('cargarEventoCercano', () => {
    it('should load closest event', () => {
      const mockResponse = { success: true, data: mockEventos };
      mockEventosService.getProximosEventos.and.returnValue(of(mockResponse));

      component.cargarEventoCercano();

      expect(component.eventoCercano).toEqual(mockEventos[0]);
    });

    it('should handle empty response', () => {
      const mockResponse = { success: true, data: [] };
      mockEventosService.getProximosEventos.and.returnValue(of(mockResponse));

      component.cargarEventoCercano();

      expect(component.eventoCercano).toBeNull();
    });

    it('should handle service error', () => {
      mockEventosService.getProximosEventos.and.returnValue(throwError('Error'));
      spyOn(console, 'error');

      component.cargarEventoCercano();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Filters', () => {
    beforeEach(() => {
      component.eventos = mockEventos;
    });

    it('should filter events by name', () => {
      component.filtroNombre = 'Test 1';

      const filtered = component.eventosFiltrados;

      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Evento Test 1');
    });

    it('should filter events by type', () => {
      component.filtroTipo = 'Taller';

      const filtered = component.eventosFiltrados;

      expect(filtered.length).toBe(1);
      expect(filtered[0].tipo_evento).toBe('Taller');
    });

    it('should return all events when no filters', () => {
      const filtered = component.eventosFiltrados;

      expect(filtered.length).toBe(2);
    });
  });

  describe('Filter Management', () => {
    it('should detect active filters', () => {
      component.filtroNombre = 'test';

      expect(component.hayFiltrosActivos()).toBe(true);
    });

    it('should detect no active filters', () => {
      component.filtroNombre = '';
      component.filtroTipo = 'todos';

      expect(component.hayFiltrosActivos()).toBe(false);
    });

    it('should clear all filters', () => {
      component.filtroNombre = 'test';
      component.filtroTipo = 'Conferencia';
      spyOn(component, 'aplicarFiltros');

      component.limpiarTodosFiltros();

      expect(component.filtroNombre).toBe('');
      expect(component.filtroTipo).toBe('todos');
      expect(component.aplicarFiltros).toHaveBeenCalled();
    });

    it('should reset filters', () => {
      component.filtroNombre = 'test';
      spyOn(component, 'aplicarFiltros');

      component.resetearFiltros();

      expect(component.filtroNombre).toBe('');
      expect(component.aplicarFiltros).toHaveBeenCalled();
    });
  });

  describe('Calendar Methods', () => {
    it('should toggle calendar modal', () => {
      spyOn(component, 'generarEventosCalendarioCompleto').and.returnValue([]);

      component.openCalendar();

      expect(component.mostrarModalCalendario).toBe(true);
      expect(component.generarEventosCalendarioCompleto).toHaveBeenCalled();
    });

    it('should navigate to next month', () => {
      const currentMonth = component.viewDate.getMonth();

      component.siguienteMes();

      expect(component.viewDate.getMonth()).toBe((currentMonth + 1) % 12);
    });

    it('should navigate to previous month', () => {
      const currentMonth = component.viewDate.getMonth();

      component.anteriorMes();

      const expectedMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      expect(component.viewDate.getMonth()).toBe(expectedMonth);
    });
  });

  describe('Image Methods', () => {
    it('should return image URL from slider', () => {
      const evento = mockEventos[0];

      const imageUrl = component.getSliderImage(evento);

      expect(imageUrl).toBe('http://example.com/image1.jpg');
    });

    it('should return default image when no event', () => {
      const imageUrl = component.getSliderImage(null);

      expect(imageUrl).toBe('assets/default-image.jpg');
    });

    it('should return destacado image', () => {
      component.eventoDestacado = mockEventos[0];

      const imageUrl = component.getImagenEventoDestacado();

      expect(imageUrl).toBe('http://example.com/image1.jpg');
    });

    it('should return default destacado image when no event', () => {
      component.eventoDestacado = undefined;

      const imageUrl = component.getImagenEventoDestacado();

      expect(imageUrl).toBe('assets/images/eventos/default.jpg');
    });
  });

  describe('Event Processing', () => {
    it('should find closest event', () => {
      component.eventos = mockEventos;

      component.obtenerEventoMasProximo();

      expect(component.eventoMasCercano).toBeTruthy();
    });

    it('should handle no events for closest', () => {
      component.eventos = [];

      component.obtenerEventoMasProximo();

      expect(component.eventoMasCercano).toBeNull();
    });
  });

  describe('Calendar Event Generation', () => {
    it('should generate calendar events', () => {
      const calendarEvents = component.generarEventosParaCalendario(mockEventos);

      expect(calendarEvents.length).toBe(2);
      expect(calendarEvents[0].title).toBe('Evento Test 1');
    });

    it('should generate complete calendar events', () => {
      component.eventos = mockEventos;

      const calendarEvents = component.generarEventosCalendarioCompleto();

      expect(calendarEvents.length).toBe(2);
      expect(calendarEvents[0].meta.eventoData).toEqual(mockEventos[0]);
    });
  });

  describe('Utility Methods', () => {
    it('should get unique event types', () => {
      component.eventos = mockEventos;

      const tipos = component.tiposEventosUnicos;

      expect(tipos).toContain('Conferencia');
      expect(tipos).toContain('Taller');
    });

    it('should update calendar', () => {
      component.eventos = mockEventos;

      component.actualizarCalendario();

      expect(component.calendarEvents.length).toBe(2);
    });

    it('should apply filters and update calendar', () => {
      spyOn(component, 'actualizarCalendario');

      component.aplicarFiltros();

      expect(component.actualizarCalendario).toHaveBeenCalled();
    });

    it('should update view', () => {
      spyOn(component, 'actualizarCalendario');

      component.actualizarVista();

      expect(component.actualizarCalendario).toHaveBeenCalled();
    });
  });
});
