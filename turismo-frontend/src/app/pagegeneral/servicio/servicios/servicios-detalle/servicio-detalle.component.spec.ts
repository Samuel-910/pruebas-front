import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ServicioDetalleComponent } from './servicio-detalle.component';
import { TurismoService } from '../../../../core/services/turismo.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CarritoService } from '../../../../core/services/carrito.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

// Stub data
type ServicioDetalleStub = any;
const mockServicio: ServicioDetalleStub = {
  id: 1,
  nombre: 'Test Service',
  descripcion: 'Desc',
  precio_referencial: 100,
  emprendedor_id: 10,
  estado: true,
  capacidad: '5',
  latitud: 0,
  longitud: 0,
  ubicacion_referencia: 'Here',
  emprendedor: { id: 10, nombre: 'Emp', tipo_servicio: 'TS', telefono: '123', email: 'e@e', ubicacion: 'X', precio_rango: '50-100', categoria: 'Cat' },
  categorias: [{ id: 2, nombre: 'Aventura' }],
  horarios: [ { id: 1, dia_semana: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', activo: true } ],
  sliders: [
    { id: 1, url: 'u1', url_completa: 'full1', nombre: 'Img1', orden: 1 },
    { id: 2, url: 'u2', url_completa: 'full2', nombre: 'Img2', orden: 2 }
  ]
};
const relatedServicios = [ { ...mockServicio, id: 3 } ];

describe('ServicioDetalleComponent', () => {
  let component: ServicioDetalleComponent;
  let fixture: ComponentFixture<ServicioDetalleComponent>;
  let turismoSpy: jasmine.SpyObj<TurismoService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let carritoSpy: jasmine.SpyObj<CarritoService>;

  beforeEach(waitForAsync(() => {
    turismoSpy = jasmine.createSpyObj('TurismoService', [ 'getServicio', 'getServiciosByCategoria', 'verificarDisponibilidadServicio' ]);
    authSpy = jasmine.createSpyObj('AuthService', [ 'isLoggedIn' ]);
    carritoSpy = jasmine.createSpyObj('CarritoService', [ 'agregarAlCarrito', 'getTotalItems' ]);

    TestBed.configureTestingModule({
      imports: [ ServicioDetalleComponent, RouterTestingModule ],
      providers: [
        { provide: TurismoService, useValue: turismoSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: CarritoService, useValue: carritoSpy },
        { provide: ActivatedRoute, useValue: { params: of({ id: mockServicio.id }) } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicioDetalleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & cargarServicio', () => {
    beforeEach(fakeAsync(() => {
      turismoSpy.getServicio.and.returnValue(of(mockServicio));
      turismoSpy.getServiciosByCategoria.and.returnValue(of(relatedServicios));
      fixture.detectChanges();
      tick();
    }));

    it('should load servicio and related servicios', () => {
      expect(component.servicio()).toBeTruthy();
      expect(component.servicio()!.id).toBe(mockServicio.id);
      expect(component.serviciosRelacionados().length).toBe(1);
    });

    it('imagen navigation should cycle correctly', () => {
      expect(component.imagenActual).toContain('full1');
      component.imagenSiguiente();
      expect(component.imagenActual).toContain('full2');
      component.imagenAnterior();
      expect(component.imagenActual).toContain('full1');
      component.cambiarImagen(1);
      expect(component.imagenActual).toContain('full2');
    });
  });

  describe('Utility methods', () => {
    it('formatearDiaCompleto should capitalize days', () => {
      expect(component.formatearDiaCompleto('lunes')).toBe('Lunes');
      expect(component.formatearDiaCompleto('unknown')).toBe('unknown');
    });

    it('formatearHora should convert 24h to 12h', () => {
      expect(component.formatearHora('00:00')).toBe('12:00 AM');
      expect(component.formatearHora('13:05')).toBe('1:05 PM');
      expect(component.formatearHora('')).toBe('');
    });

    it('calcularDuracionMinutos should compute correctly', () => {
      component.horaInicio = '08:00';
      component.horaFin = '10:30';
      expect(component.calcularDuracionMinutos()).toBe(150);
    });

    it('validarHorarios should enforce fin > inicio', () => {
      component.horaInicio = '10:00'; component.horaFin = '09:00';
      expect((component as any).validarHorarios()).toBeFalse();
      component.horaFin = '11:00';
      expect((component as any).validarHorarios()).toBeTrue();
    });
  });

  describe('Carrito operations', () => {
    beforeEach(() => {
      authSpy.isLoggedIn.and.returnValue(true);
      carritoSpy.agregarAlCarrito.and.returnValue(of(void 0));
      component.servicio.set(mockServicio as any);
      component.fechaConsulta = new Date().toISOString().split('T')[0];
      component.horaInicio = '09:00';
      component.horaFin = '10:00';
      component.resultadoDisponibilidad = true;
    });

    it('getTotalItemsCarrito delegates to service', () => {
      carritoSpy.getTotalItems.and.returnValue(3);
      expect(component.getTotalItemsCarrito()).toBe(3);
    });
  });
});
