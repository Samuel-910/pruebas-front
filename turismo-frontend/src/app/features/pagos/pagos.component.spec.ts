import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { PagosComponent } from './pagos.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('PagosComponent', () => {
  let component: PagosComponent;
  let fixture: ComponentFixture<PagosComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const activatedRouteStub = {
      url: of([{ path: 'visa' }]), // puedes cambiar entre 'visa' o 'yape'
      queryParams: of({ monto: 150 })
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [PagosComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería establecer el método de pago según la ruta', () => {
    expect(component.metodoPago).toBe('visa');
  });

  it('debería establecer el montoSimulado desde queryParams', () => {
    expect(component.montoSimulado).toBe(150);
  });

  it('formatearNumeroTarjeta debería dar formato 4-4-4-4', () => {
    const event = { target: { value: '1234567812345678' } };
    component.formatearNumeroTarjeta(event);
    expect(component.datosTarjeta.numero).toBe('1234 5678 1234 5678');
  });

  it('formatearExpiracion debería dar formato MM/YY', () => {
    const event = { target: { value: '1125' } };
    component.formatearExpiracion(event);
    expect(component.datosTarjeta.expiracion).toBe('11/25');
  });

  it('formularioValido debería validar campos correctos', () => {
    component.datosTarjeta = {
      numero: '1234 5678 1234 5678',
      expiracion: '12/25',
      cvv: '123',
      titular: 'Juan Pérez'
    };
    expect(component.formularioValido()).toBeTrue();
  });

  it('simularPagoExitoso debería cambiar el estado luego de 3 segundos', fakeAsync(() => {
    component.simularPagoExitoso();
    expect(component.procesandoPago).toBeTrue();
    tick(3000);
    expect(component.procesandoPago).toBeFalse();
    expect(component.pagoExitoso).toBeTrue();
  }));

  it('volverAReservas debería redirigir al dashboard de reservas', () => {
    component.volverAReservas();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/reservas/mis-reservas']);
  });
});
