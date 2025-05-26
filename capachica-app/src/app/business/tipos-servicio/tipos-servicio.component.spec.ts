import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TiposServicioComponent } from './tipos-servicio.component';
import { TiposServicioService } from '../../core/services/tipos-servicios.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';

describe('TiposServicioComponent', () => {
  let component: TiposServicioComponent;
  let fixture: ComponentFixture<TiposServicioComponent>;
  let tiposService: jasmine.SpyObj<TiposServicioService>;
  let router: Router;
  let swalFire: jasmine.Spy;

  beforeEach(async () => {
    tiposService = jasmine.createSpyObj('TiposServicioService', [
      'listarTiposServicio',
      'eliminarTipoServicio'
    ]);

    swalFire = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));

    await TestBed.configureTestingModule({
      imports: [
        TiposServicioComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule    // ← aquí
      ],
      providers: [
        { provide: TiposServicioService, useValue: tiposService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TiposServicioComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create and load tipos', fakeAsync(() => {
    const mockList = [
      { nombre: 'A', descripcion: 'Desc A', requiereCupo: true },
      { nombre: 'B', descripcion: 'Desc B', requiereCupo: false }
    ];
    tiposService.listarTiposServicio.and.returnValue(of(mockList));

    fixture.detectChanges(); // ngOnInit
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.tiposServicio).toEqual(mockList);
    expect(component.tiposServicioFiltrados).toEqual(mockList);
  }));

  it('should handle error on load tipos', fakeAsync(() => {
    spyOn(console, 'error');
    tiposService.listarTiposServicio.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error al obtener tipos de servicio:', jasmine.any(Error));
    expect(component.isLoading).toBeTrue();
  }));

  describe('ngDoCheck filtering', () => {
    beforeEach(() => {
      component.tiposServicio = [
        { nombre: 'Alpha', descripcion: 'First', requiereCupo: true },
        { nombre: 'Beta', descripcion: 'Second', requiereCupo: false }
      ];
    });

    it('filters by nombre', () => {
      component.columnaBusqueda = 'nombre';
      component.filtroBusqueda = 'alp';
      component.ngDoCheck();
      expect(component.tiposServicioFiltrados).toEqual([ component.tiposServicio[0] ]);
    });

    it('filters by descripcion', () => {
      component.columnaBusqueda = 'descripcion';
      component.filtroBusqueda = 'sec';
      component.ngDoCheck();
      expect(component.tiposServicioFiltrados).toEqual([ component.tiposServicio[1] ]);
    });

    it('filters by requiereCupo', () => {
      component.columnaBusqueda = 'requiereCupo';
      component.filtroBusqueda = 'false';
      component.ngDoCheck();
      expect(component.tiposServicioFiltrados).toEqual([ component.tiposServicio[1] ]);
    });

    it('returns all when filter empty', () => {
      component.filtroBusqueda = '';
      component.ngDoCheck();
      expect(component.tiposServicioFiltrados.length).toBe(2);
    });
  });

  it('editar() navigates to edit path', () => {
    const navSpy = spyOn(router, 'navigate');
    component.editar('123');
    expect(navSpy).toHaveBeenCalledWith(['/edittiposervicio/123']);
  });

  describe('eliminar()', () => {
    it('does nothing on cancel', fakeAsync(() => {
      tiposService.eliminarTipoServicio.and.returnValue(of({}));
      swalFire.and.returnValue(Promise.resolve({ isConfirmed: false } as any));

      component.eliminar('5');
      tick();

      expect(tiposService.eliminarTipoServicio).not.toHaveBeenCalled();
    }));

    it('deletes and reloads on confirm', fakeAsync(() => {
      tiposService.eliminarTipoServicio.and.returnValue(of({}));
      const loadSpy = spyOn(component, 'cargarTiposServicio');
      swalFire.and.returnValues(
        Promise.resolve({ isConfirmed: true } as any),
        Promise.resolve({}) as any
      );

      component.eliminar('7');
      tick(); // after confirm
      expect(tiposService.eliminarTipoServicio).toHaveBeenCalledWith('7');
      tick(); // after success dialog
      expect(loadSpy).toHaveBeenCalled();
    }));

    it('shows error dialog on delete failure', fakeAsync(() => {
      spyOn(console, 'error');
      tiposService.eliminarTipoServicio.and.returnValue(throwError(() => new Error('fail')));
      swalFire.and.returnValue(Promise.resolve({ isConfirmed: true } as any));

      component.eliminar('9');
      tick();

      expect(console.error).toHaveBeenCalledWith('Error al eliminar tipo de servicio:', jasmine.any(Error));
      expect(swalFire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el tipo de servicio.'
      });
    }));
  });
});
