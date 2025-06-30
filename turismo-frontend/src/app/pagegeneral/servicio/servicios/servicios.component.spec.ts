import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ServiciosComponent } from './servicios.component';
import { TurismoService } from '../../../core/services/turismo.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

// Stub data
type ServicioDetalleStub = any;
const mockServicios: ServicioDetalleStub[] = [{
  id: 1,
  nombre: 'Test Service',
  descripcion: 'Desc',
  precio_referencial: 100,
  emprendedor_id: 10,
  estado: true,
  capacidad: '10',
  latitud: 0,
  longitud: 0,
  ubicacion_referencia: 'Here',
  emprendedor: { id: 10, nombre: 'Emp', tipo_servicio: 'TS', telefono: '123', email: 'e@e', ubicacion: 'X', precio_rango: '50-100', categoria: 'Cat' },
  categorias: [{ id: 5, nombre: 'Aventura' }],
  horarios: [{ id: 2, dia_semana: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', activo: true }],
  sliders: [{ id: 3, url: 'url', url_completa: 'fullUrl', nombre: 'Img', orden: 1 }]
}];

describe('ServiciosComponent', () => {
  let component: ServiciosComponent;
  let fixture: ComponentFixture<ServiciosComponent>;
  let turismoServiceSpy: jasmine.SpyObj<TurismoService>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('TurismoService', [
      'getServicios',
      'getCategorias',
      'getEmprendedores',
      'getServiciosByCategoria',
      'getServiciosByEmprendedor',
      'getServiciosByUbicacion'
    ]);

    TestBed.configureTestingModule({
      imports: [ ServiciosComponent, RouterTestingModule ],
      providers: [
        { provide: TurismoService, useValue: spy }
      ]
    }).compileComponents();

    turismoServiceSpy = TestBed.inject(TurismoService) as jasmine.SpyObj<TurismoService>;
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiciosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & cargarDatosIniciales', () => {
    beforeEach(fakeAsync(() => {
      turismoServiceSpy.getServicios.and.returnValue(of({ data: mockServicios } as any));
      turismoServiceSpy.getCategorias.and.returnValue(of([{ id: 5, nombre: 'Aventura', descripcion: '', icono_url: '' }]));
      turismoServiceSpy.getEmprendedores.and.returnValue(of({ data: [{ id: 10, nombre: 'Emp', tipo_servicio: '', categoria: '' }] } as any));

      fixture.detectChanges(); // ngOnInit -> cargarDatosIniciales
      tick();
    }));

    it('should load serviciosOriginales and servicios', () => {
      expect(component.serviciosOriginales().length).toBe(1);
      expect(component.servicios().length).toBe(1);
      expect(component.cargando()).toBeFalse();
    });

    it('should load categorias and emprendedores', () => {
      expect(component.categorias().find(c => c.id === 5)?.nombre).toBe('Aventura');
      expect(component.emprendedores().find(e => e.id === 10)?.nombre).toBe('Emp');
    });
  });

  describe('Logic methods', () => {
    beforeEach(() => {
      component.serviciosOriginales.set(mockServicios as any);
      component.servicios.set(mockServicios as any);
    });

    it('formatearDia should map days correctly', () => {
      expect(component.formatearDia('lunes')).toBe('Lun');
      expect(component.formatearDia(3)).toBe('Mié');
      expect(component.formatearDia('xyz')).toBe('xyz');
    });

    it('getIconoCategoria should return correct key', () => {
      expect(component.getIconoCategoria('Tour emocionante')).toBe('tours');
      expect(component.getIconoCategoria('Aventura extrema')).toBe('aventura');
      expect(component.getIconoCategoria('Algo desconocido')).toBe('default');
    });

    it('serviciosFiltrados should filter by busqueda', () => {
      // Inicializar signal de servicios para disparar el computed con nueva instancia
      component.servicios.set([...component.serviciosOriginales()]);

      component.filtros.busqueda = 'test';
      // Reasignar para forzar recálculo con referencia distinta
      component.servicios.set([...component.serviciosOriginales()]);
      expect(component.serviciosFiltrados().length).toBe(1);

      component.filtros.busqueda = 'no-match';
      // Reasignar nuevamente con nueva instancia
      component.servicios.set([...component.serviciosOriginales()]);
      expect(component.serviciosFiltrados().length).toBe(0);
    });

    it('contarServiciosPorCategoria should count correctly', () => {
      expect(component.contarServiciosPorCategoria(5)).toBe(1);
      expect(component.contarServiciosPorCategoria(999)).toBe(0);
    });
  });
});
