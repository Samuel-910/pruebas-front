import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventoService } from './evento.service';
import { environment } from '../../../environments/environments';

describe('EventoService', () => {
  let service: EventoService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventoService]
    });
    service = TestBed.inject(EventoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Eventos', () => {
    it('should get all eventos', () => {
      service.getEventos().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should get one evento by id', () => {
      const id = 1;
      service.getEvento(id).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should create an evento', () => {
      const newEvento = {
        titulo: 'Test',
        descripcion: 'Desc',
        fecha_inicio: '2025-01-01',
        fecha_fin: '2025-01-02',
        lugar: 'Lima',
        capacidad: 100,
        precio: 50
      };
      service.createEvento(newEvento).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEvento);
      req.flush({});
    });

    it('should update an evento', () => {
      const id = 1;
      const updateData = { titulo: 'Updated' };
      service.updateEvento(id, updateData).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({});
    });

    it('should delete an evento', () => {
      const id = 1;
      service.deleteEvento(id).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should get eventos by categoria', () => {
      const categoria = 'cultural';
      service.getEventosByCategoria(categoria).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/categoria/${categoria}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should get eventos proximos', () => {
      service.getEventosProximos().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/proximos`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should get eventos pasados', () => {
      service.getEventosPasados().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/pasados`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should search eventos', () => {
      const termino = 'música';
      service.buscarEventos(termino).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/eventos/buscar/${termino}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('Reservas', () => {
    it('should get all reservas', () => {
      service.getReservas().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/reservas`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should get one reserva by id', () => {
      const id = 1;
      service.getReserva(id).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/reservas/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should create a reserva', () => {
      const newReserva = { evento_id: 1, usuario_id: 2, cantidad: 3 };
      service.createReserva(newReserva).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/reservas`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newReserva);
      req.flush({});
    });

    it('should update a reserva', () => {
      const id = 1;
      const updateReserva = { cantidad: 4 };
      service.updateReserva(id, updateReserva).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/reservas/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateReserva);
      req.flush({});
    });

    it('should delete a reserva', () => {
      const id = 1;
      service.deleteReserva(id).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/reservas/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
