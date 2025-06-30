// add-to-cart.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddToCartComponent } from './add-to-cart.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService, CarritoItem } from '../../../../core/services/carrito.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Servicio, Emprendedor } from '../../../../core/services/turismo.service';
import { By } from '@angular/platform-browser';

class CarritoServiceStub {
  items: CarritoItem[] = [];
  agregarAlCarrito(item: CarritoItem) {
    this.items.push(item);
    return of({});
  }
  getTotalItems() {
    return this.items.length;
  }
}

class AuthServiceStub {
  private logged = false;
  isLoggedIn() { return this.logged; }
  setLogged(value: boolean) { this.logged = value; }
}

class RouterStub {
  navigateSpy = jasmine.createSpy('navigate');
  url = '/current';
  navigate(commands: any[], extras?: any) {
    this.navigateSpy(commands, extras);
  }
}

describe('AddToCartComponent', () => {
  let component: AddToCartComponent;
  let fixture: ComponentFixture<AddToCartComponent>;
  let carritoService: CarritoServiceStub;
  let authService: AuthServiceStub;
  let router: RouterStub;
  const mockServicio: Servicio = { id: 1 } as Servicio;
  const mockEmprendedor: Emprendedor = { id: 2 } as Emprendedor;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, AddToCartComponent],
      providers: [
        { provide: CarritoService, useClass: CarritoServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: Router, useClass: RouterStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCartComponent);
    component = fixture.componentInstance;
    carritoService = TestBed.inject(CarritoService) as any;
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;

    component.servicio = mockServicio;
    component.emprendedor = mockEmprendedor;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require login and redirect if not logged in', () => {
    authService.setLogged(false);
    spyOn(component, 'redirectToLogin');
    component.agregarAlCarrito();
    expect(component.redirectToLogin).toHaveBeenCalled();
  });

  describe('form validation', () => {
    beforeEach(() => authService.setLogged(true));

    it('should show error when no fecha', () => {
      component.fechaInicio = '';
      component.horaInicio = '10:00';
      component.duracionMinutos = 60;
      component.agregarAlCarrito();
      expect(component.errorMessage()).toBe('Selecciona una fecha');
    });

    it('should show error when no hora', () => {
      component.fechaInicio = new Date().toISOString().split('T')[0];
      component.horaInicio = '';
      component.duracionMinutos = 60;
      component.agregarAlCarrito();
      expect(component.errorMessage()).toBe('Selecciona una hora de inicio');
    });

    it('should show error for custom duration below min', () => {
      component.fechaInicio = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      component.horaInicio = '10:00';
      component.duracionMinutos = 'custom';
      component.duracionPersonalizada = 10;
      component.agregarAlCarrito();
      expect(component.errorMessage()).toBe('La duración mínima es de 30 minutos');
    });
  });

  it('should add item to cart and show success', fakeAsync(() => {
    authService.setLogged(true);
    component.fechaInicio = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    component.horaInicio = '09:00';
    component.duracionMinutos = 120;
    spyOn(carritoService, 'agregarAlCarrito').and.returnValue(of({}));

    component.agregarAlCarrito();
    tick();
    expect(component.successMessage()).toContain('exitosamente');
  }));

  it('should handle service error', fakeAsync(() => {
    authService.setLogged(true);
    component.fechaInicio = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    component.horaInicio = '09:00';
    component.duracionMinutos = 60;
    const err = { message: 'Network error' };
    spyOn(carritoService, 'agregarAlCarrito').and.returnValue(throwError(() => err));

    component.agregarAlCarrito();
    tick();
    expect(component.errorMessage()).toBe('Network error');
  }));

  it('should navigate to login on redirectToLogin', () => {
    component.redirectToLogin();
    expect(router.navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { redirect: router.url } });
  });

  it('should navigate to cart on verCarrito', () => {
    component.verCarrito();
    expect(router.navigateSpy).toHaveBeenCalledWith(['/carrito'], undefined);
  });
});
