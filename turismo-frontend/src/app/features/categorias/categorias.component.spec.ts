import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoriasComponent } from './categorias.component';
import { CategoriasService } from './categorias.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PaginatedResponse } from '../../core/services/admin.service';
import { Categoria } from './categoria.model';  // Asegúrate que esta ruta sea correcta

describe('CategoriasComponent', () => {
  let component: CategoriasComponent;
  let fixture: ComponentFixture<CategoriasComponent>;
  let mockCategoriasService: jasmine.SpyObj<CategoriasService>;

  const mockCategoria: Categoria = {
    id: 1,
    nombre: 'Electrónicos',
    descripcion: 'Productos electrónicos',
    imagen: 'image.jpg',
    estado: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
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

  beforeEach(async () => {
    mockCategoriasService = jasmine.createSpyObj('CategoriasService', [
      'getCategorias',
      'createCategoria',
      'updateCategoria',
      'deleteCategoria',
      'toggleEstado'
    ]);

    mockCategoriasService.getCategorias.and.returnValue(of(mockPaginatedResponse));
    mockCategoriasService.createCategoria.and.returnValue(of(mockCategoria));
    mockCategoriasService.updateCategoria.and.returnValue(of(mockCategoria));
    mockCategoriasService.deleteCategoria.and.returnValue(of({}));
    mockCategoriasService.toggleEstado.and.returnValue(of(mockCategoria));

    await TestBed.configureTestingModule({
      imports: [
        CategoriasComponent,   // <-- Aquí va el componente standalone
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        FormBuilder,
        { provide: CategoriasService, useValue: mockCategoriasService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    const formValue = component.categoriaForm.value;
    expect(formValue.estado).toBeTrue();
    expect(formValue.nombre).toBe('');
  });

  it('should load categorias on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(mockCategoriasService.getCategorias).toHaveBeenCalled();
    expect(component.categorias.length).toBe(1);
    expect(component.loading).toBeFalse();
  }));

  it('should search categorias', () => {
    component.searchTerm = 'Test';
    component.search();
    expect(mockCategoriasService.getCategorias).toHaveBeenCalledWith(1, 10, 'Test');
  });

  it('should open create modal and reset form', () => {
    component.openCreateModal();
    expect(component.isModalOpen).toBeTrue();
    expect(component.isEditing).toBeFalse();
    expect(component.currentCategoriaId).toBeNull();
    expect(component.categoriaForm.value.estado).toBeTrue();
  });

  it('should open edit modal with category values', () => {
    component.openEditModal(mockCategoria);
    expect(component.isModalOpen).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.currentCategoriaId).toBe(mockCategoria.id);
    expect(component.categoriaForm.value.nombre).toBe(mockCategoria.nombre);
  });

  it('should close modal', () => {
    component.isModalOpen = true;
    component.closeModal();
    expect(component.isModalOpen).toBeFalse();
  });

  it('should not submit invalid form', () => {
    component.categoriaForm.patchValue({ nombre: '' });
    component.saveCategoria();
    expect(mockCategoriasService.createCategoria).not.toHaveBeenCalled();
  });

  it('should create categoria when form is valid and not editing', fakeAsync(() => {
    component.openCreateModal();
    component.categoriaForm.setValue({
      nombre: 'Nueva',
      descripcion: 'desc',
      imagen: 'img.jpg',
      estado: true
    });
    component.saveCategoria();
    tick();
    expect(mockCategoriasService.createCategoria).toHaveBeenCalled();
    expect(component.isModalOpen).toBeFalse();
  }));

  it('should update categoria when editing and form is valid', fakeAsync(() => {
    component.openEditModal(mockCategoria);
    component.categoriaForm.patchValue({ nombre: 'Editado' });
    component.saveCategoria();
    tick();
    expect(mockCategoriasService.updateCategoria).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(component.isModalOpen).toBeFalse();
  }));

  it('should delete categoria with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteCategoria(1);
    expect(mockCategoriasService.deleteCategoria).toHaveBeenCalledWith(1);
  });

  it('should not delete categoria if user cancels', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteCategoria(1);
    expect(mockCategoriasService.deleteCategoria).not.toHaveBeenCalled();
  });

  it('should toggle estado and reload categorias', () => {
    component.toggleEstado(mockCategoria);
    expect(mockCategoriasService.toggleEstado).toHaveBeenCalledWith(1, false);
  });

  it('should change page and load categorias', () => {
    component.changePage(3);
    expect(component.currentPage).toBe(3);
    expect(mockCategoriasService.getCategorias).toHaveBeenCalledWith(3, 10, '');
  });

  it('should format date string', () => {
    const result = component.formatDate('2023-06-30');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should return empty string if date is undefined', () => {
    expect(component.formatDate(undefined)).toBe('');
  });

  it('should handle error when getCategorias fails', fakeAsync(() => {
    mockCategoriasService.getCategorias.and.returnValue(throwError(() => new Error('Error')));
    component.loadCategorias();
    tick();
    expect(component.loading).toBeFalse();
  }));
});