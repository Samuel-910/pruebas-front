import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoriasService } from './categorias.service';
import { environment } from '../../../environments/environments';
import { Categoria, CategoriaDTO } from './categoria.model';
import { PaginatedResponse } from '../../core/services/admin.service';

describe('CategoriasService', () => {
  let service: CategoriasService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  const mockCategoria: Categoria = {
    id: 1,
    nombre: 'Electrónicos',
    descripcion: 'Productos electrónicos',
    imagen: 'image.jpg',
    estado: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  };

  const mockCategoriaDTO: CategoriaDTO = {
    nombre: 'Electrónicos',
    descripcion: 'Productos electrónicos',
    imagen: 'image.jpg',
    estado: true
  };

  const mockPaginatedResponse: PaginatedResponse<Categoria> = {
    data: [mockCategoria],
    current_page: 1,
    first_page_url: '',
    from: 1,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: 10,
    prev_page_url: null,
    to: 1,
    total: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoriasService]
    });
    service = TestBed.inject(CategoriasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch categorias with default params', () => {
    service.getCategorias().subscribe(response => {
      expect(response).toEqual(mockPaginatedResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/categorias?page=1&per_page=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockPaginatedResponse });
  });

  it('should fetch categorias with search term', () => {
    service.getCategorias(2, 5, 'electro').subscribe(response => {
      expect(response).toEqual(mockPaginatedResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/categorias?page=2&per_page=5&search=electro`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockPaginatedResponse });
  });

  it('should fetch categoria by id', () => {
    service.getCategoria(1).subscribe(response => {
      expect(response).toEqual(mockCategoria);
    });

    const req = httpMock.expectOne(`${API_URL}/categorias/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockCategoria });
  });

  it('should create categoria', () => {
    service.createCategoria(mockCategoriaDTO).subscribe(response => {
      expect(response).toEqual(mockCategoria);
    });

    const req = httpMock.expectOne(`${API_URL}/categorias`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCategoriaDTO);
    req.flush({ success: true, data: mockCategoria });
  });

  it('should update categoria', () => {
    service.updateCategoria(1, mockCategoriaDTO).subscribe(response => {
      expect(response).toEqual(mockCategoria);
    });

    const req = httpMock.expectOne(`${API_URL}/categorias/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockCategoriaDTO);
    req.flush({ success: true, data: mockCategoria });
  });

  it('should delete categoria', () => {
    service.deleteCategoria(1).subscribe(response => {
      expect(response).toEqual({ success: true, message: 'Deleted' });
    });

    const req = httpMock.expectOne(`${API_URL}/categorias/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, message: 'Deleted' });
  });

  it('should toggle estado', () => {
    service.toggleEstado(1, false).subscribe(response => {
      expect(response).toEqual(mockCategoria);
    });

    const req = httpMock.expectOne(`${API_URL}/categorias/1/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: false });
    req.flush({ success: true, data: mockCategoria });
  });

  // Opcional: pruebas de manejo de error para algún método
  it('should handle error on getCategorias', () => {
    service.getCategorias().subscribe({
      next: () => fail('expected an error'),
      error: error => expect(error.status).toBe(500)
    });

    const req = httpMock.expectOne(`${API_URL}/categorias?page=1&per_page=10`);
    req.flush('Error server', { status: 500, statusText: 'Server Error' });
  });

});