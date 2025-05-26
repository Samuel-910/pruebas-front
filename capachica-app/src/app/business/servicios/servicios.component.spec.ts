import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServicioComponent } from './servicios.component';
import { ServiciosService } from '../../core/services/servicios.service';
import { AuthService } from '../../core/services/auth.service';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';

describe('ServicioComponent', () => {
  let component: ServicioComponent;
  let fixture: ComponentFixture<ServicioComponent>;
  let serviciosService: jasmine.SpyObj<ServiciosService>;
  let authService: jasmine.SpyObj<AuthService>;
  let emprendimientoService: jasmine.SpyObj<EmprendimientoService>;
  let swalFireSpy: jasmine.Spy;

  beforeEach(async () => {
    serviciosService       = jasmine.createSpyObj('ServiciosService', ['listarServicios','eliminarServicio']);
    authService            = jasmine.createSpyObj('AuthService', ['getUsuarioId','getUsuarioRol']);
    emprendimientoService  = jasmine.createSpyObj('EmprendimientoService', ['listarEmprendimientosPorUsuario']);
    swalFireSpy            = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true }));

    await TestBed.configureTestingModule({
      imports: [
        ServicioComponent,
        RouterTestingModule.withRoutes([])    // proporciona root para RouterModule
      ],
      providers: [
        { provide: ServiciosService,      useValue: serviciosService },
        { provide: AuthService,           useValue: authService },
        { provide: EmprendimientoService, useValue: emprendimientoService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargarServicios como SuperAdmin', () => {
    it('debe traer todos los servicios y asignar serviciosFiltrados', fakeAsync(() => {
      authService.getUsuarioRol.and.returnValue(['SuperAdmin']);
      const mockList = [{ id:1, nombre:'A' }, { id:2, nombre:'B' }];
      serviciosService.listarServicios.and.returnValue(of(mockList));

      component.cargarServicios();
      tick();

      expect(serviciosService.listarServicios).toHaveBeenCalled();
      expect(component.servicios).toEqual(mockList);
      expect(component.serviciosFiltrados).toEqual(mockList);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('cargarServicios como Emprendedor', () => {
    it('debe filtrar servicios según emprendimientos del usuario', fakeAsync(() => {
      authService.getUsuarioRol.and.returnValue(['Emprendedor']);
      authService.getUsuarioId.and.returnValue(10);
      const emprs = [{ id: 100 }, { id: 200 }];
      emprendimientoService.listarEmprendimientosPorUsuario.and.returnValue(of(emprs));

      const servicios = [
        { id:1, serviciosEmprendedores: [{ emprendimientoId:100 }] },
        { id:2, serviciosEmprendedores: [{ emprendimientoId:999 }] }
      ];
      serviciosService.listarServicios.and.returnValue(of(servicios));

      component.cargarServicios();
      tick(); // para listarEmprendimientos
      tick(); // para listarServicios

      expect(emprendimientoService.listarEmprendimientosPorUsuario).toHaveBeenCalledWith(10);
      expect(serviciosService.listarServicios).toHaveBeenCalled();
      expect(component.servicios.length).toBe(1);
      expect(component.servicios[0].id).toBe(1);
      expect(component.isLoading).toBeFalse();
      expect(component.serviciosFiltrados).toEqual(component.servicios);
    }));

    it('muestra error de SweetAlert si falla listarEmprendimientos', fakeAsync(() => {
      authService.getUsuarioRol.and.returnValue(['Emprendedor']);
      emprendimientoService.listarEmprendimientosPorUsuario.and.returnValue(throwError(() => new Error('fail')));

      component.cargarServicios();
      tick();

      expect(swalFireSpy).toHaveBeenCalledWith('Error', 'No se pudieron cargar los emprendimientos', 'error');
    }));
  });

  describe('ngDoCheck — filtrado de búsqueda', () => {
    beforeEach(() => {
      component.servicios = [
        { nombre: 'Tour Inca', descripcion:'A', precioBase:'100', estado:'activo', tipoServicio:{ nombre:'A' } },
        { nombre: 'Caminata', descripcion:'B', precioBase:'200', estado:'inactivo', tipoServicio:{ nombre:'B' } }
      ];
    });

    it('filtra por nombre', () => {
      component.columnaBusqueda = 'nombre';
      component.filtroBusqueda = 'tour';
      component.ngDoCheck();
      expect(component.serviciosFiltrados.length).toBe(1);
      expect(component.serviciosFiltrados[0].nombre).toContain('Tour');
    });

    it('filtra por descripcion', () => {
      component.columnaBusqueda = 'descripcion';
      component.filtroBusqueda = 'b';
      component.ngDoCheck();
      expect(component.serviciosFiltrados.length).toBe(1);
      expect(component.serviciosFiltrados[0].descripcion).toBe('B');
    });

    it('saca todo si filtro está vacío', () => {
      component.filtroBusqueda = '';
      component.ngDoCheck();
      expect(component.serviciosFiltrados.length).toBe(2);
    });
  });

  describe('editar()', () => {
    it('debe navegar a /editservicio/:id', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      component.editar('42');
      expect(router.navigate).toHaveBeenCalledWith(['/editservicio/42']);
    });
  });

  describe('eliminar()', () => {
    it('si cancela no llama al servicio', fakeAsync(() => {
      // Swal.fire devuelve isConfirmed=false
      component.eliminar('5');
      tick();
      expect(serviciosService.eliminarServicio).not.toHaveBeenCalled();
    }));

    it('si confirma llama a eliminarServicio y recarga', fakeAsync(() => {
      swalFireSpy.and.returnValue(Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false }));
      serviciosService.eliminarServicio.and.returnValue(of(void 0));
      spyOn(component, 'cargarServicios');

      component.eliminar('7');
      tick();

      expect(serviciosService.eliminarServicio).toHaveBeenCalledWith('7');
      tick(); // para el then interno de Swal
      expect(component.cargarServicios).toHaveBeenCalled();
    }));

    it('muestra error si eliminarServicio falla', fakeAsync(() => {
      swalFireSpy.and.returnValue(Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false }));
      serviciosService.eliminarServicio.and.returnValue(throwError(() => new Error()));
      component.eliminar('8');
      tick();

      expect(swalFireSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'error', title: 'Error'
      }));
    }));
  });
});
