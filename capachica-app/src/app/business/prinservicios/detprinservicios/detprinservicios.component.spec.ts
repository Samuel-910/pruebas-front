import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { DetprinserviciosComponent, CartItem } from './detprinservicios.component';
import { ServiciosService }      from '../../../core/services/servicios.service';
import { ResenaService }         from '../../../core/services/resenas.service';
import { AuthService }           from '../../../core/services/auth.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';

// Stub de Navbar como standalone
@Component({
  selector: 'app-navbar',
  standalone: true,
  template: ''
})
class NavbarStubComponent {}

describe('DetprinserviciosComponent (standalone)', () => {
  let component: DetprinserviciosComponent;
  let fixture: ComponentFixture<DetprinserviciosComponent>;
  let router: Router;
  let serviciosService: jasmine.SpyObj<ServiciosService>;
  let resenaService: jasmine.SpyObj<ResenaService>;
  let authService: jasmine.SpyObj<AuthService>;
  let emprService: jasmine.SpyObj<EmprendimientoService>;
  let sanitizer: DomSanitizer;

  const mockActivatedRoute = {
    snapshot: { paramMap: { get: (_key: string) => '123' } }
  };

  const servicioMock = {
    id: 123,
    tipoServicioId: 3,
    precioBase: 100,
    nombre: 'Test',
    latitud: 1,
    longitud: 2,
    serviciosEmprendedores: [{ emprendimientoId: 555 }],
    tipoServicio: { nombre: 'Tour' },
    descripcion: 'Desc',
    imagenes: [{ url: 'img.jpg' }],
    detallesServicio: { Observaciones: 'Obs' },
    moneda: 'USD'
  };
  const emprendimientoMock = { id: 555, name: 'EM' };
  const resenasMock = [{ usuarioId: 7, comentario: 'Bien' }];
  const usuarioMock = { id: 7, nombre: 'User' };

  beforeEach(async () => {
    serviciosService = jasmine.createSpyObj('ServiciosService', ['obtenerServicio']);
    resenaService    = jasmine.createSpyObj('ResenaService', ['obtenerReseñasPorServicio']);
    authService      = jasmine.createSpyObj('AuthService', ['getUsuarioById']);
    emprService      = jasmine.createSpyObj('EmprendimientoService', [
      'verEmprendimiento',
      'listarEmprendimientos'
    ]);

    serviciosService.obtenerServicio.and.returnValue(of(servicioMock));
    emprService.verEmprendimiento.and.returnValue(of(emprendimientoMock));
    emprService.listarEmprendimientos.and.returnValue(of([]));
    resenaService.obtenerReseñasPorServicio.and.returnValue(of(resenasMock));
    authService.getUsuarioById.and.returnValue(of(usuarioMock));

    await TestBed.configureTestingModule({
      imports: [
        DetprinserviciosComponent,
        NavbarStubComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: ServiciosService,      useValue: serviciosService },
        { provide: ResenaService,         useValue: resenaService },
        { provide: AuthService,           useValue: authService },
        { provide: EmprendimientoService, useValue: emprService },
        { provide: ActivatedRoute,        useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(DetprinserviciosComponent);
    component = fixture.componentInstance;
    router    = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.callThrough();
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
  });

  it('debería crearse y cargar servicio, emprendimiento y reseñas', () => {
    expect(component).toBeTruthy();
    expect(serviciosService.obtenerServicio).toHaveBeenCalledWith('123');
    expect(component.servicios).toEqual(servicioMock);
    expect(emprService.verEmprendimiento).toHaveBeenCalledWith(555);
    expect(component.emprendimientos).toEqual(emprendimientoMock);
    expect(resenaService.obtenerReseñasPorServicio).toHaveBeenCalledWith('123');
    expect(component.resenas).toEqual(resenasMock);
    expect(authService.getUsuarioById).toHaveBeenCalledWith(7);
    expect(component.usuarios).toEqual(usuarioMock);
  });

  it('buildMapUrl debe generar SafeResourceUrl correcto', () => {
    const url = `https://maps.google.com/maps?q=1,2&z=13&output=embed`;
    const safe = sanitizer.bypassSecurityTrustResourceUrl(url);
    component['buildMapUrl'](1, 2);
    expect(component.mapUrl).toEqual(safe);
  });

  describe('calculatePrice', () => {
    it('tipoServicioId 3: multiplica noches * precioBase * personas', () => {
      component.servicios = servicioMock;
      component.calculatePrice('2025-06-01', '2025-06-04', 2);
      expect(component.totalPrice).toBe(3 * 100 * 2);
    });
    it('otros tipos: precioBase * personas', () => {
      component.servicios = { ...servicioMock, tipoServicioId: 2 };
      component.calculatePrice('', '', 3);
      expect(component.totalPrice).toBe(100 * 3);
    });
    it('numeroPersonas <=0 debe limpiar totalPrice', () => {
      component.calculatePrice('', '', 0);
      expect(component.totalPrice).toBeNull();
    });
  });

  // describe('addToCart', () => {
  //   beforeEach(() => localStorage.clear());

  //   it('debe añadir un nuevo ítem al carrito y navegar', fakeAsync(() => {
  //     component.servicios = servicioMock;
  //     component.totalPrice = 500;
  //     component.dateForm.setValue({ startDate: '2025-06-10', endDate: '2025-06-10', numeroPersonas: 1 });

  //     component.addToCart();
  //     tick();

  //     const stored: CartItem[] = JSON.parse(localStorage.getItem('cart')!);
  //     expect(stored.length).toBe(1);
  //     expect(stored[0].id).toBe(123);
  //     expect(stored[0].totalPrice).toBe(500);
  //     expect(router.navigateByUrl).toHaveBeenCalledWith('/', { skipLocationChange: true });
  //   }));

  //   it('si ya existe, muestra alerta info', () => {
  //     spyOn(Swal, 'fire');
  //     localStorage.setItem('cart', JSON.stringify([{ id: 123 }]));
  //     component.servicios = servicioMock;
  //     component.addToCart();

  //     expect(Swal.fire).toHaveBeenCalledWith(
  //       jasmine.objectContaining({
  //         icon: 'info',
  //         title: '¡Ya tienes esta reserva!',
  //         text: 'Este servicio ya está en tu carrito.',
  //         confirmButtonText: 'Aceptar'
  //       })
  //     );
  //   });
  // });

  describe('carousel & helpers', () => {
    beforeEach(() => component.servicios = { imagenes: [1, 2, 3] } as any);

    it('resetCarousel pone currentSlide a 0', () => {
      component.currentSlide = 2;
      component.resetCarousel();
      expect(component.currentSlide).toBe(0);
    });
    it('prevSlide retrocede módulo longitud', () => {
      component.currentSlide = 0;
      component.prevSlide();
      expect(component.currentSlide).toBe(2);
    });
    it('nextSlide avanza módulo longitud', () => {
      component.currentSlide = 2;
      component.nextSlide();
      expect(component.currentSlide).toBe(0);
    });
    it('isArray y getIterable funcionan', () => {
      expect(component.isArray([1])).toBeTrue();
      expect(component.getIterable(5)).toEqual([]);
    });
  });
});
