import { TestBed } from '@angular/core/testing';
import { PlanesService } from './planes.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environments';
import { PlanFormData, PlanEmprendedorRequest } from '../models/plan.model';

describe('PlanesService', () => {
  let service: PlanesService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanesService]
    });
    service = TestBed.inject(PlanesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- getPlanes ---
  it('getPlanes debe obtener planes con filtros', () => {
    const filtros = { estado: 'activo', dificultad: 'dificil' }; // Changed from 'alta' to 'dificil'
    const mockResponse = {
      success: true,
      data: {
        data: [{ id: 1, nombre: 'Plan 1' }, { id: 2, nombre: 'Plan 2' }],
        meta: { total: 2 }
      }
    };

    service.getPlanes(filtros).subscribe(data => {
      expect(data.data.length).toBe(2);
      expect(data.data[0].nombre).toBe('Plan 1');
    });

    const req = httpMock.expectOne(request =>
      request.url === `${API_URL}/planes` &&
      request.params.get('estado') === 'activo' &&
      request.params.get('dificultad') === 'dificil' // Changed from 'alta' to 'dificil'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // --- getPlan ---
  it('getPlan debe obtener un plan por ID', () => {
    const id = 123;
    const mockPlan = { id, nombre: 'Plan Especial' };

    service.getPlan(id).subscribe(plan => {
      expect(plan.id).toBe(id);
      expect(plan.nombre).toBe('Plan Especial');
    });

    const req = httpMock.expectOne(`${API_URL}/planes/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockPlan });
  });

  // --- createPlan ---
  it('createPlan debe crear un plan enviando FormData', () => {
    const formDataObj: PlanFormData = {
      nombre: 'Plan Nuevo',
      descripcion: 'Descripción',
      capacidad: 10,
      duracion_dias: 5,
      es_publico: true,
      estado: 'activo',
      dificultad: 'moderado', // Changed from 'media' to 'moderado'
      emprendedores: [],
      dias: []
    };

    const mockPlan = { id: 10, ...formDataObj };

    service.createPlan(formDataObj).subscribe(plan => {
      expect(plan.id).toBe(10);
      expect(plan.nombre).toBe('Plan Nuevo');
    });

    const req = httpMock.expectOne(`${API_URL}/planes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get('nombre')).toBe('Plan Nuevo');
    expect(req.request.body.get('es_publico')).toBe('1');
    req.flush({ success: true, data: mockPlan });
  });

  // --- updatePlan ---
  it('updatePlan debe actualizar un plan con método POST y _method=PUT', () => {
    const id = 15;
    const formDataObj: PlanFormData = {
      nombre: 'Plan Actualizado',
      descripcion: 'Nueva descripción',
      capacidad: 20,
      duracion_dias: 7,
      es_publico: false,
      estado: 'inactivo',
      dificultad: 'dificil', // Changed from 'alta' to 'dificil'
      emprendedores: [],
      dias: []
    };

    const mockPlan = { id, ...formDataObj };

    service.updatePlan(id, formDataObj).subscribe(plan => {
      expect(plan.id).toBe(id);
      expect(plan.estado).toBe('inactivo');
    });

    const req = httpMock.expectOne(`${API_URL}/planes/${id}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get('_method')).toBe('PUT');
    expect(req.request.body.get('estado')).toBe('inactivo');
    req.flush({ success: true, data: mockPlan });
  });

  // --- deletePlan ---
  it('deletePlan debe eliminar un plan', () => {
    const id = 20;

    service.deletePlan(id).subscribe(response => {
      expect(response.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${API_URL}/planes/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  // --- cambiarEstadoPlan ---
  it('cambiarEstadoPlan debe cambiar el estado de un plan', () => {
    const id = 5;
    const nuevoEstado = 'activo';

    service.cambiarEstadoPlan(id, nuevoEstado).subscribe(plan => {
      expect(plan.estado).toBe(nuevoEstado);
    });

    const req = httpMock.expectOne(`${API_URL}/planes/${id}/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.estado).toBe(nuevoEstado);
    req.flush({ success: true, data: { id, estado: nuevoEstado } });
  });

  // --- buscarPlanes ---
  it('buscarPlanes debe buscar planes con término y filtros', () => {
    const termino = 'aventura';
    const filtros = { estado: 'activo' };
    const mockPlanes = [
      { id: 101, nombre: 'Plan Aventura' },
      { id: 102, nombre: 'Plan Explora' }
    ];

    service.buscarPlanes(termino, filtros).subscribe(planes => {
      expect(planes.length).toBe(2);
      expect(planes[0].nombre).toContain('Aventura');
    });

    const req = httpMock.expectOne(request =>
      request.url === `${API_URL}/planes/search` &&
      request.params.get('q') === termino &&
      request.params.get('estado') === 'activo'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockPlanes });
  });

  // --- agregarEmprendedorAPlan ---
  it('agregarEmprendedorAPlan debe agregar un emprendedor a un plan', () => {
    const planId = 7;
    const data: PlanEmprendedorRequest = {
      emprendedor_id: 3,
      rol: 'colaborador', // Changed from 'participante' to 'colaborador'
      es_organizador_principal: false
    };

    const mockResponse = { id: 1, ...data };

    service.agregarEmprendedorAPlan(planId, data).subscribe(res => {
      expect(res.id).toBe(1); // Changed from emprendedor_id to id
      expect(res.rol).toBe('colaborador'); // Changed from 'participante' to 'colaborador'
    });

    const req = httpMock.expectOne(`${API_URL}/planes/${planId}/emprendedores`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true, data: mockResponse });
  });

  // --- getEmprendedoresPlan ---
  it('getEmprendedoresPlan debe obtener emprendedores de un plan', () => {
    const planId = 1;
    const mockResponse = {
      success: true,
      data: [
        { id: 1, emprendedor_id: 1, rol: 'organizador', es_organizador_principal: true }, // Added 'id' property
        { id: 2, emprendedor_id: 2, rol: 'colaborador', es_organizador_principal: false } // Added 'id' property and changed 'participante' to 'colaborador'
      ],
      meta: { total: 2 }
    };

    service.getEmprendedoresPlan(planId).subscribe(res => {
      expect(res.data.length).toBe(2);
      expect(res.meta.total).toBe(2);
      expect(res.data[0].rol).toBe('organizador');
    });

    const req = httpMock.expectOne(`${API_URL}/planes/${planId}/emprendedores`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // --- getPlanesPublicos ---
  it('getPlanesPublicos debe obtener solo planes públicos activos', () => {
    const filtros = { dificultad: 'facil' }; // Changed from 'baja' to 'facil'
    const mockResponse = {
      success: true,
      data: {
        data: [{ id: 3, nombre: 'Plan Público' }],
        meta: { total: 1 }
      }
    };

    service.getPlanesPublicos(filtros).subscribe(data => {
      expect(data.data.length).toBe(1);
      expect(data.data[0].nombre).toBe('Plan Público');
    });

    const req = httpMock.expectOne(request =>
      request.url === `${API_URL}/planes/publicos` &&
      request.params.get('dificultad') === 'facil' && // Changed from 'baja' to 'facil'
      request.params.get('es_publico') === 'true' &&
      request.params.get('estado') === 'activo'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // --- verificarDisponibilidadCupos ---
  it('verificarDisponibilidadCupos debe retornar disponibilidad', () => {
    const planId = 10;
    const numeroParticipantes = 2;
    const mockResponse = {
      success: true,
      data: {
        disponible: true,
        cuposDisponibles: 5,
        mensaje: 'Hay cupos disponibles'
      }
    };

    service.verificarDisponibilidadCupos(planId, numeroParticipantes).subscribe(res => {
      expect(res.disponible).toBeTrue();
      expect(res.cuposDisponibles).toBe(5);
    });

    const req = httpMock.expectOne(request =>
      request.url === `${API_URL}/planes/verificar-cupos` &&
      request.params.get('plan_id') === planId.toString() &&
      request.params.get('numero_participantes') === numeroParticipantes.toString()
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

});