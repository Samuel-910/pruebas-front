import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { ResenaService } from './resenas.service';

describe('ResenaService', () => {
  let service: ResenaService;
  let httpMock: HttpTestingController;
  const API = 'https://capachica-app-back-production.up.railway.app/resenas';

  beforeEach(() => {
    // Simulamos que en localStorage existe un token
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResenaService]
    });

    service = TestBed.inject(ResenaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden peticiones pendientes
    httpMock.verify();
  });

  it('debería obtener todas las reseñas (GET /resenas)', () => {
    const dummyResenas = [{ id: 1, texto: '¡Hola!' }, { id: 2, texto: 'Adiós' }];

    service.obtenerReseñas().subscribe(res => {
      expect(res).toEqual(dummyResenas);
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(dummyResenas);
  });

  it('debería obtener una reseña por ID (GET /resenas/{id})', () => {
    const dummyResena = { id: 42, texto: 'Respuesta' };

    service.obtenerReseñaPorId(42).subscribe(res => {
      expect(res).toEqual(dummyResena);
    });

    const req = httpMock.expectOne(`${API}/42`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(dummyResena);
  });

  it('debería obtener reseñas por servicio (GET /resenas/servicio/{servicioId})', () => {
    const dummy = [{ id: 5, servicioId: 'A' }];

    service.obtenerReseñasPorServicio('A').subscribe(res => {
      expect(res).toEqual(dummy);
    });

    const req = httpMock.expectOne(`${API}/servicio/A`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(dummy);
  });

  it('debería obtener promedio de calificación (GET /resenas/promedio/{servicioId})', () => {
    const promedio = { servicioId: 'X', promedio: 4.5 };

    service.obtenerPromedioDeCalificacion('X').subscribe(res => {
      expect(res).toEqual(promedio);
    });

    const req = httpMock.expectOne(`${API}/promedio/X`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(promedio);
  });

});
