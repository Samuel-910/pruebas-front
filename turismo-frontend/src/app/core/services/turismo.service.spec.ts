import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TurismoService, Municipalidad, Asociacion, Emprendedor, Servicio } from './turismo.service';
import { environment } from '../../../environments/environments';

describe('TurismoService', () => {
  let service: TurismoService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TurismoService]
    });
    service = TestBed.inject(TurismoService);
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

  // Tests para Municipalidades
  describe('Municipalidades', () => {
    it('should get municipalidades', () => {
      const mockMunicipalidades: Municipalidad[] = [
        { id: 1, nombre: 'Test', descripcion: 'Test desc' }
      ];

      service.getMunicipalidades().subscribe(municipalidades => {
        expect(municipalidades).toEqual(mockMunicipalidades);
      });

      const req = httpMock.expectOne(`${API_URL}/municipalidad`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockMunicipalidades });
    });

    it('should create municipalidad', () => {
      const newMunicipalidad: Municipalidad = {
        nombre: 'Nueva Municipalidad',
        descripcion: 'Descripción test'
      };

      service.createMunicipalidad(newMunicipalidad).subscribe(result => {
        expect(result.nombre).toBe('Nueva Municipalidad');
      });

      const req = httpMock.expectOne(`${API_URL}/municipalidad`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush({ success: true, data: { id: 1, ...newMunicipalidad } });
    });
  });

  // Tests para Asociaciones
  describe('Asociaciones', () => {
    it('should get asociaciones with pagination', () => {
      const mockResponse = {
        current_page: 1,
        data: [{ id: 1, nombre: 'Test Asociacion', descripcion: 'Test', municipalidad_id: 1 }],
        total: 1,
        per_page: 10
      };

      service.getAsociaciones(1, 10).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.current_page).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/asociaciones?page=1&per_page=10`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockResponse });
    });

    it('should get asociacion by id', () => {
      const mockAsociacion: Asociacion = {
        id: 1,
        nombre: 'Test Asociacion',
        descripcion: 'Test descripcion',
        municipalidad_id: 1
      };

      service.getAsociacion(1).subscribe(asociacion => {
        expect(asociacion).toEqual(mockAsociacion);
      });

      const req = httpMock.expectOne(`${API_URL}/asociaciones/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockAsociacion });
    });
  });

  // Tests para Emprendedores
  describe('Emprendedores', () => {
    it('should get emprendedores with pagination', () => {
      const mockResponse = {
        current_page: 1,
        data: [{ 
          id: 1, 
          nombre: 'Test Emprendedor',
          tipo_servicio: 'Turismo',
          descripcion: 'Test',
          ubicacion: 'Test location',
          telefono: '123456789',
          email: 'test@test.com',
          categoria: 'turismo'
        }],
        total: 1,
        per_page: 10
      };

      service.getEmprendedores(1, 10).subscribe(response => {
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/emprendedores?page=1&per_page=10`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: mockResponse });
    });

    it('should search emprendedores', () => {
      const mockEmprendedores: Emprendedor[] = [
        { 
          id: 1, 
          nombre: 'Emprendedor Test',
          tipo_servicio: 'Turismo',
          descripcion: 'Test',
          ubicacion: 'Test',
          telefono: '123',
          email: 'test@test.com',
          categoria: 'turismo'
        }
      ];

      service.searchEmprendedores('test').subscribe(emprendedores => {
        expect(emprendedores).toEqual(mockEmprendedores);
      });

      const req = httpMock.expectOne(`${API_URL}/emprendedores/search?q=test`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: mockEmprendedores });
    });
  });

  // Tests para Servicios
  describe('Servicios', () => {
    it('should get servicios with filters', () => {
      const mockResponse = {
        current_page: 1,
        data: [{ 
          id: 1, 
          nombre: 'Test Servicio',
          emprendedor_id: 1
        }],
        total: 1,
        per_page: 10
      };

      const filters = { emprendedor_id: 1 };
      service.getServicios(1, 10, filters).subscribe(response => {
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/servicios?page=1&per_page=10&emprendedor_id=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockResponse });
    });

    it('should verify service availability', () => {
      service.verificarDisponibilidadServicio(1, '2024-01-01', '10:00', '12:00')
        .subscribe(response => {
          expect(response.disponible).toBe(true);
        });

      const req = httpMock.expectOne(`${API_URL}/servicios/verificar-disponibilidad?servicio_id=1&fecha=2024-01-01&hora_inicio=10:00&hora_fin=12:00`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, disponible: true });
    });
  });

  // Tests para Reservas
  describe('Reservas', () => {
    it('should create reserva', () => {
      const newReserva = {
        usuario_id: 1,
        codigo_reserva: 'RES001',
        estado: 'pendiente' as const,
        servicios: []
      };

      service.createReserva(newReserva).subscribe(result => {
        expect(result.codigo_reserva).toBe('RES001');
      });

      const req = httpMock.expectOne(`${API_URL}/reservas`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, data: { id: 1, ...newReserva } });
    });

    it('should change reserva status', () => {
      service.cambiarEstadoReserva(1, 'confirmada').subscribe(result => {
        expect(result.estado).toBe('confirmada');
      });

      const req = httpMock.expectOne(`${API_URL}/reservas/1/estado`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ estado: 'confirmada' });
      req.flush({ success: true, data: { id: 1, estado: 'confirmada' } });
    });
  });

  // Test para headers
  describe('Headers', () => {
    it('should include authorization header', () => {
      service.getMunicipalidades().subscribe();

      const req = httpMock.expectOne(`${API_URL}/municipalidad`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush({ success: true, data: [] });
    });
  });

  // Test para manejo de errores
  describe('Error Handling', () => {
    it('should handle HTTP errors', () => {
      service.getMunicipalidades().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/municipalidad`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});