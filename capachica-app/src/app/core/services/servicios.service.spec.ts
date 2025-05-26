import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServiciosService } from './servicios.service';
import { HttpRequest } from '@angular/common/http';

describe('ServiciosService', () => {
    let service: ServiciosService;
    let httpMock: HttpTestingController;
    const API = 'https://capachica-app-back-production.up.railway.app/servicios';
    const dummyToken = 'fake-jwt-token';

    beforeEach(() => {
        // Prepara localStorage con token
        localStorage.setItem('token', dummyToken);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ServiciosService]
        });
        service = TestBed.inject(ServiciosService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Verifica que no queden peticiones pendientes
        localStorage.removeItem('token');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#crearServicio debe hacer POST con el body y cabecera correcta', () => {
        const mockData = { nombre: 'Tour Inca', precio: 120 };
        service.crearServicio(mockData).subscribe(res => {
            expect(res).toEqual({ id: 1, ...mockData });
        });

        const req = httpMock.expectOne(API);
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${dummyToken}`);
        expect(req.request.body).toEqual(mockData);
        // Respondemos simulando la respuesta del backend
        req.flush({ id: 1, ...mockData });
    });

    it('#listarServicios debe hacer GET con cabecera correcta', () => {
        const mockList = [{ id: 1 }, { id: 2 }];
        service.listarServicios().subscribe(res => {
            expect(res).toEqual(mockList);
        });

        const req = httpMock.expectOne(API);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.has('Authorization')).toBeTrue();
        req.flush(mockList);
    });

    it('#listarServiciosPorEmprendimiento debe construir bien la URL', () => {
        const empId = '42';
        const mockList = [{ id: 10, emprendimientoId: empId }];
        service.listarServiciosPorEmprendimiento(empId).subscribe(res => {
            expect(res).toEqual(mockList);
        });

        const req = httpMock.expectOne(`${API}/emprendimiento/${empId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockList);
    });

    it('#obtenerServicio debe hacer GET a /{id}', () => {
        const mockItem = { id: 5, nombre: 'Guía Lago' };
        service.obtenerServicio(5).subscribe(res => {
            expect(res).toEqual(mockItem);
        });

        const req = httpMock.expectOne(`${API}/5`);
        expect(req.request.method).toBe('GET');
        req.flush(mockItem);
    });

    it('#actualizarServicio debe hacer PATCH a /{id}', () => {
        const update = { precio: 150 };
        service.actualizarServicio('5', update).subscribe(res => {
            expect(res).toEqual({ id: '5', ...update });
        });

        const req = httpMock.expectOne(`${API}/5`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(update);
        req.flush({ id: '5', ...update });
    });

    it('#eliminarServicio debe hacer DELETE a /{id}', () => {
        service.eliminarServicio(7).subscribe(res => {
            expect(res).toBeNull();
        });

        const req = httpMock.expectOne(`${API}/7`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('#actualizarEstadoServicio debe hacer PATCH a /{id}/estado', () => {
        const newEstado = { estado: 'inactivo' };
        service.actualizarEstadoServicio(3, newEstado).subscribe(res => {
            expect(res).toEqual({ id: 3, estado: 'inactivo' });
        });

        const req = httpMock.expectOne(`${API}/3/estado`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(newEstado);
        req.flush({ id: 3, estado: 'inactivo' });
    });

    it('#listarServiciosPorTipo debe construir URL /tipo-servicio/{tipoServicioId}', () => {
        const tipoId = 'hotel';
        const data = [{ id: 11, tipoServicioId: tipoId }];
        service.listarServiciosPorTipo(tipoId).subscribe(res => {
            expect(res).toEqual(data);
        });

        const req = httpMock.expectOne(`${API}/tipo-servicio/${tipoId}`);
        expect(req.request.method).toBe('GET');
        req.flush(data);
    });

    it('#marcarFavorito debe hacer POST y usar la ruta correcta', () => {
        service.marcarFavorito(9).subscribe(res => {
            expect(res).toEqual({ success: true });
        });

        const req = httpMock.expectOne(`${API}/9/favoriteServicio`);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true });
    });

    it('#desmarcarFavorito debe hacer DELETE y usar la ruta correcta', () => {
        service.desmarcarFavorito('9').subscribe(res => {
            expect(res).toEqual({ success: true });
        });

        const req = httpMock.expectOne(`${API}/9/favoriteServicio`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ success: true });
    });

    it('#listarFavoritos debe GET a /favoritesServicio/{idUsuario}', () => {
        const mockFavs = [{ id: 3 }, { id: 7 }];
        service.listarFavoritos(21).subscribe(res => {
            expect(res).toEqual(mockFavs);
        });

        const req = httpMock.expectOne(`${API}/favoritesServicio/21`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFavs);
    });
});
