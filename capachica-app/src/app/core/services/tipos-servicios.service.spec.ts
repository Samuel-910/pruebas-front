import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TiposServicioService } from './tipos-servicios.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';

describe('TiposServicioService', () => {
    let service: TiposServicioService;
    let httpMock: HttpTestingController;
    const API = 'https://capachica-app-back-production.up.railway.app/tipos-servicio';
    const fakeToken = 'fake-jwt';

    beforeEach(() => {
        // Ensure token in localStorage
        spyOn(localStorage, 'getItem').and.callFake((key: string) => key === 'token' ? fakeToken : null);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TiposServicioService]
        });
        service = TestBed.inject(TiposServicioService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('crearTipoServicio should POST to API with auth header', () => {
        const payload = { nombre: 'Test', descripcion: 'Desc', requiereCupo: true };
        service.crearTipoServicio(payload).subscribe();

        const req = httpMock.expectOne(API);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${fakeToken}`);
        req.flush({});
    });

    it('listarTiposServicio should GET all with auth header', () => {
        service.listarTiposServicio().subscribe();

        const req = httpMock.expectOne(API);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${fakeToken}`);
        req.flush([]);
    });

    it('obtenerTipoServicio should GET by id with auth header', () => {
        const id = 42;
        service.obtenerTipoServicio(id).subscribe();

        const req = httpMock.expectOne(`${API}/${id}`);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${fakeToken}`);
        req.flush({});
    });

    it('eliminarTipoServicio should DELETE by id with auth header', () => {
        const id = 'abc';
        service.eliminarTipoServicio(id).subscribe();

        const req = httpMock.expectOne(`${API}/${id}`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${fakeToken}`);
        req.flush({});
    });

    describe('buscarConFiltros', () => {
        it('should GET with no params when filtros empty', () => {
            service.buscarConFiltros({}).subscribe();

            const req = httpMock.expectOne((r) => r.url === API);
            expect(req.request.method).toBe('GET');
            // no auth header
            expect(req.request.headers.has('Authorization')).toBeFalse();
            expect(req.request.params.keys().length).toBe(0);
            req.flush([]);
        });

        it('should GET with only provided filtros as params', () => {
            const filtros = { nombre: 'A', lugar: 'B' };
            service.buscarConFiltros(filtros).subscribe();

            const req = httpMock.expectOne((r) => r.url === API);
            expect(req.request.method).toBe('GET');
            // auth header not included for buscarConFiltros
            expect(req.request.headers.has('Authorization')).toBeFalse();

            const params = req.request.params;
            expect(params.get('nombre')).toBe('A');
            expect(params.get('lugar')).toBe('B');
            expect(params.has('fecha')).toBeFalse();
            req.flush([]);
        });

        it('should include fecha param when provided', () => {
            const filtros = { fecha: '2025-05-25' };
            service.buscarConFiltros(filtros).subscribe();

            const req = httpMock.expectOne((r) => r.url === API);
            expect(req.request.method).toBe('GET');
            const params = req.request.params;
            expect(params.get('fecha')).toBe('2025-05-25');
            expect(params.keys().length).toBe(1);
            req.flush([]);
        });
    });
});
