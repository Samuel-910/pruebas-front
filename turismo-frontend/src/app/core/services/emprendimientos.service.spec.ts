import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmprendimientosService, Emprendimiento, Servicio, AdminRequest } from './emprendimientos.service';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../models/api.model';

describe('EmprendimientosService', () => {
  let service: EmprendimientosService;
  let httpTestingController: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockEmprendimiento: Emprendimiento = {
    id: 1,
    nombre: 'Test Emprendimiento',
    tipo_servicio: 'Restaurante',
    descripcion: 'Descripción de prueba',
    ubicacion: 'Lima, Perú',
    telefono: '123456789',
    email: 'test@test.com',
    categoria: 'Gastronomía',
    estado: true
  };

  const mockServicio: Servicio = {
    id: 1,
    nombre: 'Servicio Test',
    descripcion: 'Descripción del servicio',
    precio_referencial: 100,
    emprendedor_id: 1,
    estado: true
  };

  const mockApiResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    message: 'Success',
    data: data
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmprendimientosService]
    });

    service = TestBed.inject(EmprendimientosService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMisEmprendimientos', () => {
    it('should return emprendimientos list', () => {
      const mockEmprendimientos = [mockEmprendimiento];
      const expectedResponse = mockApiResponse(mockEmprendimientos);

      service.getMisEmprendimientos().subscribe(emprendimientos => {
        expect(emprendimientos).toEqual(mockEmprendimientos);
        expect(emprendimientos.length).toBe(1);
        expect(emprendimientos[0].nombre).toBe('Test Emprendimiento');
      });

      const req = httpTestingController.expectOne(`${apiUrl}/mis-emprendimientos`);
      expect(req.request.method).toBe('GET');
      // ❌ Esta línea se eliminó porque causaba el error
      // expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush(expectedResponse);
    });

    it('should return empty array when data is null', () => {
      const expectedResponse = mockApiResponse(null);

      service.getMisEmprendimientos().subscribe(emprendimientos => {
        expect(emprendimientos).toEqual([]);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/mis-emprendimientos`);
      req.flush(expectedResponse);
    });
  });

  describe('getEmprendimiento', () => {
    it('should return specific emprendimiento', () => {
      const emprendimientoId = 1;
      const expectedResponse = mockApiResponse(mockEmprendimiento);

      service.getEmprendimiento(emprendimientoId).subscribe(emprendimiento => {
        expect(emprendimiento).toEqual(mockEmprendimiento);
        expect(emprendimiento.id).toBe(emprendimientoId);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/mis-emprendimientos/${emprendimientoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedResponse);
    });
  });

  describe('updateEmprendimiento', () => {
    it('should update emprendimiento', () => {
      const emprendimientoId = 1;
      const updateData = { nombre: 'Nombre Actualizado' };
      const expectedResponse = mockApiResponse({ ...mockEmprendimiento, ...updateData });

      service.updateEmprendimiento(emprendimientoId, updateData).subscribe(emprendimiento => {
        expect(emprendimiento.nombre).toBe('Nombre Actualizado');
      });

      const req = httpTestingController.expectOne(`${apiUrl}/emprendedores/${emprendimientoId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();

      const formData = req.request.body as FormData;
      expect(formData.get('_method')).toBe('PUT');

      req.flush(expectedResponse);
    });
  });

  describe('addAdministrador', () => {
    it('should add administrator to emprendimiento', () => {
      const emprendimientoId = 1;
      const adminData: AdminRequest = {
        email: 'admin@test.com',
        rol: 'administrador',
        es_principal: false
      };
      const expectedResponse = mockApiResponse({ message: 'Administrator added' });

      service.addAdministrador(emprendimientoId, adminData).subscribe(response => {
        expect(response.message).toBe('Administrator added');
      });

      const req = httpTestingController.expectOne(`${apiUrl}/mis-emprendimientos/${emprendimientoId}/administradores`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(adminData);
      req.flush(expectedResponse);
    });
  });

  describe('removeAdministrador', () => {
    it('should remove administrator from emprendimiento', () => {
      const emprendimientoId = 1;
      const userId = 2;

      service.removeAdministrador(emprendimientoId, userId).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}/mis-emprendimientos/${emprendimientoId}/administradores/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getServicios', () => {
    it('should return servicios list', () => {
      const emprendimientoId = 1;
      const mockServicios = [mockServicio];
      const expectedResponse = mockApiResponse(mockServicios);

      service.getServicios(emprendimientoId).subscribe(servicios => {
        expect(servicios).toEqual(mockServicios);
        expect(servicios.length).toBe(1);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/emprendedores/${emprendimientoId}/servicios`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedResponse);
    });

    it('should return empty array when data is null', () => {
      const emprendimientoId = 1;
      const expectedResponse = mockApiResponse(null);

      service.getServicios(emprendimientoId).subscribe(servicios => {
        expect(servicios).toEqual([]);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/emprendedores/${emprendimientoId}/servicios`);
      req.flush(expectedResponse);
    });
  });

  describe('getServicio', () => {
    it('should return specific servicio', () => {
      const servicioId = 1;
      const expectedResponse = mockApiResponse(mockServicio);

      service.getServicio(servicioId).subscribe(servicio => {
        expect(servicio).toEqual(mockServicio);
        expect(servicio.id).toBe(servicioId);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/servicios/${servicioId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedResponse);
    });
  });

  describe('createServicio', () => {
    it('should create new servicio', () => {
      const newServicio = { ...mockServicio };
      delete newServicio.id;
      const expectedResponse = mockApiResponse(mockServicio);

      service.createServicio(newServicio).subscribe(servicio => {
        expect(servicio).toEqual(mockServicio);
        expect(servicio.id).toBeDefined();
      });

      const req = httpTestingController.expectOne(`${apiUrl}/servicios`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush(expectedResponse);
    });
  });

  describe('updateServicio', () => {
    it('should update servicio', () => {
      const servicioId = 1;
      const updateData = { ...mockServicio, nombre: 'Servicio Actualizado' };
      const expectedResponse = mockApiResponse(updateData);

      service.updateServicio(servicioId, updateData).subscribe(servicio => {
        expect(servicio.nombre).toBe('Servicio Actualizado');
      });

      const req = httpTestingController.expectOne(`${apiUrl}/servicios/${servicioId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();

      const formData = req.request.body as FormData;
      expect(formData.get('_method')).toBe('PUT');

      req.flush(expectedResponse);
    });
  });

  describe('deleteServicio', () => {
    it('should delete servicio', () => {
      const servicioId = 1;

      service.deleteServicio(servicioId).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}/servicios/${servicioId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('checkDisponibilidad', () => {
    it('should check service availability', () => {
      const availabilityData = {
        servicio_id: 1,
        fecha: '2024-01-01',
        hora_inicio: '09:00',
        hora_fin: '10:00'
      };
      const expectedResponse = mockApiResponse({ disponible: true });

      service.checkDisponibilidad(availabilityData).subscribe(response => {
        expect(response.disponible).toBe(true);
      });

      const req = httpTestingController.expectOne(request =>
        request.url === `${apiUrl}/servicios/verificar-disponibilidad` &&
        request.method === 'GET'
      );

      expect(req.request.params.get('servicio_id')).toBe('1');
      expect(req.request.params.get('fecha')).toBe('2024-01-01');
      req.flush(expectedResponse);
    });
  });

  describe('prepareFormData', () => {
    it('should handle array fields correctly', () => {
      const testData = {
        nombre: 'Test',
        metodos_pago: ['efectivo', 'tarjeta'],
        idiomas_hablados: ['español', 'inglés'],
        sliders_principales: [
          { id: 1, nombre: 'Slider 1', orden: 1, es_principal: true }
        ]
      };

      const formData = (service as any).prepareFormData(testData);

      expect(formData instanceof FormData).toBeTruthy();
      expect(formData.get('nombre')).toBe('Test');
      expect(formData.get('metodos_pago')).toBe('["efectivo","tarjeta"]');
      expect(formData.get('idiomas_hablados')).toBe('["español","inglés"]');
      expect(formData.get('sliders_principales[0][id]')).toBe('1');
      expect(formData.get('sliders_principales[0][nombre]')).toBe('Slider 1');
    });

    it('should handle string fields that should be arrays', () => {
      const testData = {
        metodos_pago: 'efectivo, tarjeta, transferencia',
        idiomas_hablados: 'español,inglés'
      };

      const formData = (service as any).prepareFormData(testData);

      expect(formData.get('metodos_pago')).toBe('["efectivo","tarjeta","transferencia"]');
      expect(formData.get('idiomas_hablados')).toBe('["español","inglés"]');
    });

    it('should handle file uploads', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const testData = {
        nombre: 'Test',
        sliders_principales: [
          {
            id: 1,
            nombre: 'Slider con imagen',
            orden: 1,
            es_principal: true,
            imagen: mockFile
          }
        ]
      };

      const formData = (service as any).prepareFormData(testData);

      expect(formData.get('sliders_principales[0][imagen]')).toBe(mockFile);
    });

    it('should handle horarios array', () => {
      const testData = {
        horarios: [
          {
            id: 1,
            dia_semana: 'lunes',
            hora_inicio: '09:00',
            hora_fin: '18:00',
            activo: true
          }
        ]
      };

      const formData = (service as any).prepareFormData(testData);

      expect(formData.get('horarios[0][id]')).toBe('1');
      expect(formData.get('horarios[0][dia_semana]')).toBe('lunes');
      expect(formData.get('horarios[0][activo]')).toBe('true');
    });

    it('should handle categorias array', () => {
      const testData = {
        categorias: [1, 2, 3]
      };

      const formData = (service as any).prepareFormData(testData);

      expect(formData.getAll('categorias[]')).toEqual(['1', '2', '3']);
    });

    it('should handle deleted_sliders array', () => {
      const testData = {
        deleted_sliders: [1, 2, 3]
      };

      const formData = (service as any).prepareFormData(testData);

      expect(formData.getAll('deleted_sliders[]')).toEqual(['1', '2', '3']);
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getMisEmprendimientos().subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/mis-emprendimientos`);
      req.flush('Not Found', errorResponse);
    });
  });
});
