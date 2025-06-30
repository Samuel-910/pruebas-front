import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservasService, Reserva, ReservaServicio, CreateReservaRequest, FiltrosReserva, PaginatedResponse } from './reservas.service';
import { environment } from '../../../environments/environments';

describe('ReservasService', () => {
  let service: ReservasService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  // Mock data
  const mockReserva: Reserva = {
    id: 1,
    usuario_id: 1,
    codigo_reserva: 'RES001',
    estado: 'pendiente',
    notas: 'Reserva de prueba',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    usuario: {
      id: 1,
      name: 'Usuario Test',
      email: 'test@example.com'
    },
    servicios: []
  };

  const mockPaginatedResponse: PaginatedResponse<Reserva> = {
    current_page: 1,
    data: [mockReserva],
    from: 1,
    to: 1,
    total: 1,
    per_page: 10,
    last_page: 1,
    path: '/reservas',
    first_page_url: '/reservas?page=1',
    last_page_url: '/reservas?page=1',
    next_page_url: null,
    prev_page_url: null,
    links: []
  };

  const mockReservaServicio: ReservaServicio = {
    id: 1,
    servicio_id: 1,
    emprendedor_id: 1,
    fecha_inicio: '2024-01-01',
    hora_inicio: '09:00',
    hora_fin: '10:00',
    duracion_minutos: 60,
    estado: 'pendiente'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservasService]
    });

    service = TestBed.inject(ReservasService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getReservas', () => {
    it('should fetch reservas with pagination', () => {
      const page = 1;
      const perPage = 10;

      service.getReservas(page, perPage).subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
        expect(response.data.length).toBe(1);
        expect(response.current_page).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas?page=1&per_page=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      
      req.flush({
        success: true,
        data: mockPaginatedResponse
      });
    });

    it('should apply filters when provided', () => {
      const filters: FiltrosReserva = {
        codigo: 'RES001',
        estado: 'pendiente',
        usuario_id: 1
      };

      service.getReservas(1, 10, filters).subscribe();

      const req = httpMock.expectOne(
        `${API_URL}/reservas?page=1&per_page=10&codigo=RES001&estado=pendiente&usuario_id=1`
      );
      expect(req.request.method).toBe('GET');
      
      req.flush({
        success: true,
        data: mockPaginatedResponse
      });
    });
  });

  describe('getReserva', () => {
    it('should fetch a single reserva by id', () => {
      const reservaId = 1;

      service.getReserva(reservaId).subscribe(response => {
        expect(response).toEqual(mockReserva);
        expect(response.id).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas/${reservaId}`);
      expect(req.request.method).toBe('GET');
      
      req.flush({
        success: true,
        data: mockReserva
      });
    });

    it('should handle array response and return first element', () => {
      service.getReserva(1).subscribe(response => {
        expect(response).toEqual(mockReserva);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas/1`);
      req.flush({
        success: true,
        data: [mockReserva]
      });
    });
  });

  describe('createReserva', () => {
    it('should create a new reserva', () => {
      const newReserva: CreateReservaRequest = {
        usuario_id: 1,
        codigo_reserva: 'RES002',
        estado: 'pendiente',
        notas: 'Nueva reserva',
        servicios: [{
          servicio_id: 1,
          emprendedor_id: 1,
          fecha_inicio: '2024-01-01',
          hora_inicio: '09:00',
          hora_fin: '10:00',
          duracion_minutos: 60,
          estado: 'pendiente'
        }]
      };

      service.createReserva(newReserva).subscribe(response => {
        expect(response).toEqual(mockReserva);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newReserva);
      
      req.flush({
        success: true,
        data: mockReserva
      });
    });
  });

  describe('updateReserva', () => {
    it('should update an existing reserva', () => {
      const reservaId = 1;
      const updateData: CreateReservaRequest = {
        usuario_id: 1,
        codigo_reserva: 'RES001',
        estado: 'confirmada',
        notas: 'Reserva actualizada',
        servicios: []
      };

      service.updateReserva(reservaId, updateData).subscribe(response => {
        expect(response).toEqual(mockReserva);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas/${reservaId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      
      req.flush({
        success: true,
        data: mockReserva
      });
    });
  });

  describe('deleteReserva', () => {
    it('should delete a reserva', () => {
      const reservaId = 1;

      service.deleteReserva(reservaId).subscribe();

      const req = httpMock.expectOne(`${API_URL}/reservas/${reservaId}`);
      expect(req.request.method).toBe('DELETE');
      
      req.flush(null);
    });
  });

  describe('cambiarEstadoReserva', () => {
    it('should change reserva status', () => {
      const reservaId = 1;
      const nuevoEstado = 'confirmada';

      service.cambiarEstadoReserva(reservaId, nuevoEstado).subscribe(response => {
        expect(response).toEqual(mockReserva);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas/${reservaId}/estado`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ estado: nuevoEstado });
      
      req.flush({
        success: true,
        data: mockReserva
      });
    });
  });

  describe('cambiarEstadoServicioReserva', () => {
    it('should change servicio reserva status', () => {
      const servicioReservaId = 1;
      const nuevoEstado = 'confirmado';

      service.cambiarEstadoServicioReserva(servicioReservaId, nuevoEstado).subscribe(response => {
        expect(response).toEqual(mockReservaServicio);
      });

      const req = httpMock.expectOne(`${API_URL}/reserva-servicios/${servicioReservaId}/estado`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ estado: nuevoEstado });
      
      req.flush({
        success: true,
        data: mockReservaServicio,
        message: 'Estado actualizado'
      });
    });
  });

  describe('verificarDisponibilidadServicio', () => {
    it('should verify service availability', () => {
      const servicioId = 1;
      const fechaInicio = '2024-01-01';
      const fechaFin = '2024-01-01';
      const horaInicio = '09:00';
      const horaFin = '10:00';

      service.verificarDisponibilidadServicio(
        servicioId, 
        fechaInicio, 
        fechaFin, 
        horaInicio, 
        horaFin
      ).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.disponible).toBe(true);
      });

      const expectedUrl = `${API_URL}/reserva-servicios/verificar-disponibilidad?servicio_id=1&fecha_inicio=2024-01-01&hora_inicio=09:00&hora_fin=10:00&fecha_fin=2024-01-01`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      
      req.flush({
        success: true,
        disponible: true
      });
    });

    it('should handle availability check without fecha_fin', () => {
      service.verificarDisponibilidadServicio(1, '2024-01-01', null, '09:00', '10:00').subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url.includes('/verificar-disponibilidad') && 
               !request.url.includes('fecha_fin');
      });
      expect(req.request.method).toBe('GET');
      
      req.flush({
        success: true,
        disponible: true
      });
    });
  });

  describe('getEstadisticasReservas', () => {
    it('should calculate reservas statistics', () => {
      const mockReservas = [
        { ...mockReserva, estado: 'pendiente' as const },
        { ...mockReserva, id: 2, estado: 'confirmada' as const },
        { ...mockReserva, id: 3, estado: 'completada' as const },
        { ...mockReserva, id: 4, estado: 'cancelada' as const }
      ];

      const mockStatsResponse = {
        ...mockPaginatedResponse,
        data: mockReservas,
        total: 4
      };

      service.getEstadisticasReservas().subscribe(stats => {
        expect(stats.total).toBe(4);
        expect(stats.pendientes).toBe(1);
        expect(stats.confirmadas).toBe(1);
        expect(stats.completadas).toBe(1);
        expect(stats.canceladas).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/reservas?page=1&per_page=1000`);
      req.flush({
        success: true,
        data: mockStatsResponse
      });
    });
  });

  describe('getCalendarioReservas', () => {
    it('should fetch calendar reservas', () => {
      const fechaInicio = '2024-01-01';
      const fechaFin = '2024-01-31';

      service.getCalendarioReservas(fechaInicio, fechaFin).subscribe(response => {
        expect(response).toEqual([mockReservaServicio]);
      });

      const req = httpMock.expectOne(
        `${API_URL}/reserva-servicios/calendario?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );
      expect(req.request.method).toBe('GET');
      
      req.flush({
        success: true,
        data: [mockReservaServicio]
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getReserva(1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/reservas/1`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      service.getReservas().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ProgressEvent);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/reservas?page=1&per_page=10`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('Authentication Headers', () => {
    it('should include auth token in headers', () => {
      service.getReservas().subscribe();

      const req = httpMock.expectOne(`${API_URL}/reservas?page=1&per_page=10`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      
      req.flush({
        success: true,
        data: mockPaginatedResponse
      });
    });

    it('should handle missing auth token', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      service.getReservas().subscribe();

      const req = httpMock.expectOne(`${API_URL}/reservas?page=1&per_page=10`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer null');
      
      req.flush({
        success: true,
        data: mockPaginatedResponse
      });
    });
  });
});