import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmprendimientoAdminService } from './emprendimiento-admin.service';
import { environment } from '../../../environments/environments';

describe('EmprendimientoAdminService', () => {
  let service: EmprendimientoAdminService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmprendimientoAdminService],
    });
    service = TestBed.inject(EmprendimientoAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getMisEmprendimientos debe llamar al endpoint y devolver datos', () => {
    const dummyEmprendimientos = [
      { id: 1, nombre: 'Emprendimiento 1' },
      { id: 2, nombre: 'Emprendimiento 2' },
    ];

    service.getMisEmprendimientos().subscribe(emprendimientos => {
      expect(emprendimientos).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({ id: 1, nombre: 'Emprendimiento 1' }),
          jasmine.objectContaining({ id: 2, nombre: 'Emprendimiento 2' }),
        ])
      );
    });

    const req = httpMock.expectOne(`${API_URL}/mis-emprendimientos`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: dummyEmprendimientos });
  });

  it('getEmprendimiento debe obtener un emprendimiento por id', () => {
    const dummyEmprendimiento = { id: 5, nombre: 'Emprendimiento 5' };

    service.getEmprendimiento(5).subscribe(emprendimiento => {
      expect(emprendimiento).toEqual(jasmine.objectContaining({ id: 5, nombre: 'Emprendimiento 5' }));
    });

    const req = httpMock.expectOne(`${API_URL}/mis-emprendimientos/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: dummyEmprendimiento });
  });

  it('updateEmprendimiento debe enviar un POST con _method PUT', () => {
    const id = 3;
    const updateData = { nombre: 'Nuevo Nombre' };

    service.updateEmprendimiento(id, updateData).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ nombre: 'Nuevo Nombre' }));
    });

    const req = httpMock.expectOne(`${API_URL}/emprendedores/${id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('_method')).toBeTrue();
    expect(req.request.body.get('_method')).toBe('PUT');
    req.flush({ data: updateData });
  });

  it('deleteServicio debe hacer DELETE correctamente', () => {
    const id = 10;

    service.deleteServicio(id).subscribe(response => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${API_URL}/servicios/${id}`);
    expect(req.request.method).toBe('DELETE');
    // CAMBIO: Remover el wrapper 'data' para que coincida con lo que espera el test
    req.flush({ success: true });
  });

  it('checkDisponibilidad debe enviar parámetros correctamente', () => {
    const params = {
      servicio_id: 1,
      fecha_inicio: '2025-07-01',
      fecha_fin: '2025-07-05'
    };

    const dummyResponse = { disponible: true };

    service.checkDisponibilidad(params).subscribe(resp => {
      expect(resp).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${API_URL}/reserva-servicios/verificar-disponibilidad` &&
      request.params.get('servicio_id') === '1' &&
      request.params.get('fecha_inicio') === '2025-07-01' &&
      request.params.get('fecha_fin') === '2025-07-05'
    );

    expect(req.request.method).toBe('GET');
    req.flush({ data: dummyResponse });
  });
});