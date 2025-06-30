import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlanesDetalleComponent } from './planes-detalle.component';
import { PlanesService } from '../../../core/services/planes.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environments';

const mockPlan = {
  id: 1,
  nombre: 'Plan Test',
  descripcion: 'Desc test',
  duracion_dias: 2,
  precio_total: 100,
  dificultad: 'facil' as 'facil',
  estado: 'activo' as 'activo',
  capacidad: 10,
  cupos_disponibles: 5,
  imagen_principal_url: '/img.jpg',
  imagenes_galeria_urls: ['/img1.jpg', '/img2.jpg'],
  dias: [
    { numero_dia: 1, titulo: 'Día 1', descripcion: 'Desc 1' },
    { numero_dia: 2, titulo: 'Día 2', descripcion: 'Desc 2' }
  ]
};

describe('PlanesDetalleComponent', () => {
  let component: PlanesDetalleComponent;
  let fixture: ComponentFixture<PlanesDetalleComponent>;
  let planesServiceSpy: jasmine.SpyObj<PlanesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  beforeEach(() => {
    planesServiceSpy = jasmine.createSpyObj('PlanesService', ['getPlanPublico', 'inscribirseAPlan']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['isDarkMode']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/planes/detalle/1' });
    activatedRouteSpy = {
      params: of({ id: 1 }),
      snapshot: { params: { id: 1 } }
    };

    TestBed.configureTestingModule({
      imports: [PlanesDetalleComponent],
      providers: [
        { provide: PlanesService, useValue: planesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        FormBuilder
      ]
    });
    fixture = TestBed.createComponent(PlanesDetalleComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar el plan correctamente', fakeAsync(() => {
    planesServiceSpy.getPlanPublico.and.returnValue(of(mockPlan));
    component.cargarPlan(1);
    tick();
    expect(component.plan()).toEqual(mockPlan);
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('');
  }));

  it('debe manejar error al cargar el plan', fakeAsync(() => {
    planesServiceSpy.getPlanPublico.and.returnValue(throwError(() => new Error('error')));
    component.cargarPlan(1);
    tick();
    expect(component.plan()).toBeNull();
    expect(component.loading()).toBeFalse();
    expect(component.error()).toContain('No se pudo cargar');
  }));

  it('debe calcular el total correctamente', () => {
    component.plan.set(mockPlan as any);
    component.inscripcionForm.patchValue({ numero_participantes: 3 });
    expect(component.totalCalculado()).toBe(300);
  });

  it('debe devolver el estado de dark mode', () => {
    themeServiceSpy.isDarkMode.and.returnValue(true);
    expect(component.isDarkMode()).toBeTrue();
    themeServiceSpy.isDarkMode.and.returnValue(false);
    expect(component.isDarkMode()).toBeFalse();
  });

  it('debe devolver los cupos disponibles', () => {
    component.plan.set(mockPlan as any);
    expect(component.cuposDisponibles()).toBe(5);
  });

  it('debe inscribir correctamente (éxito)', fakeAsync(() => {
    component.plan.set(mockPlan as any);
    authServiceSpy.isLoggedIn.and.returnValue(true);
    planesServiceSpy.inscribirseAPlan.and.returnValue(of({ plan_id: 1, usuario_id: 1, estado: 'confirmada', numero_participantes: 1 }));
    spyOn(component, 'cargarPlan');
    component.inscripcionForm.patchValue({ numero_participantes: 1, metodo_pago: 'efectivo' });
    component.onSubmitInscripcion();
    tick();
    expect(component.enviandoInscripcion()).toBeFalse();
    expect(component.mostrarExito()).toBeTrue();
    expect(component.cargarPlan).toHaveBeenCalled();
  }));

  it('no debe inscribir si el usuario no está logueado', () => {
    component.plan.set(mockPlan as any);
    authServiceSpy.isLoggedIn.and.returnValue(false);
    component.inscripcionForm.patchValue({ numero_participantes: 1, metodo_pago: 'efectivo' });
    component.onSubmitInscripcion();
    expect(component.enviandoInscripcion()).toBeFalse();
  });

  it('debe manejar error al inscribir', fakeAsync(() => {
    component.plan.set(mockPlan as any);
    authServiceSpy.isLoggedIn.and.returnValue(true);
    planesServiceSpy.inscribirseAPlan.and.returnValue(throwError(() => ({ error: { message: 'Error insc' } })));
    spyOn(window, 'alert');
    component.inscripcionForm.patchValue({ numero_participantes: 1, metodo_pago: 'efectivo' });
    component.onSubmitInscripcion();
    tick();
    expect(window.alert).toHaveBeenCalledWith('Error insc');
    expect(component.enviandoInscripcion()).toBeFalse();
  }));

  it('debe incrementar y decrementar participantes', () => {
    component.plan.set(mockPlan as any);
    component.inscripcionForm.patchValue({ numero_participantes: 1 });
    component.incrementParticipantes();
    expect(component.inscripcionForm.get('numero_participantes')?.value).toBe(2);
    component.decrementParticipantes();
    expect(component.inscripcionForm.get('numero_participantes')?.value).toBe(1);
  });

  it('debe navegar a login', () => {
    component.plan.set(mockPlan as any);
    component.irALogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
  });

  it('debe navegar a registro', () => {
    component.plan.set(mockPlan as any);
    component.irARegistro();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register'], jasmine.any(Object));
  });

  it('debe navegar a la lista de planes', () => {
    component.volverALista();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/planes']);
  });

  it('debe navegar a mis inscripciones y cerrar modal', () => {
    component.mostrarExito.set(true);
    component.irAMisInscripciones();
    expect(component.mostrarExito()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/inscripciones']);
  });

  it('debe abrir y cerrar el modal de imagen', () => {
    component.abrirImagenModal('url');
    expect(component.imagenModalAbierta()).toBeTrue();
    expect(component.imagenModalSrc()).toBe('url');
    component.cerrarImagenModal();
    expect(component.imagenModalAbierta()).toBeFalse();
    expect(component.imagenModalSrc()).toBe('');
  });

  it('debe manejar error de imagen', () => {
    const event = { target: { src: '' } };
    component.onImageError(event);
    expect(event.target.src).toBe('/assets/images/default-plan.jpg');
  });

  it('debe devolver la etiqueta de dificultad', () => {
    expect(component.getDificultadLabel('facil')).toBe('Fácil');
    expect(component.getDificultadLabel('moderado')).toBe('Moderado');
    expect(component.getDificultadLabel('dificil')).toBe('Difícil');
    expect(component.getDificultadLabel('otra')).toBe('otra');
  });

  it('debe exponer el environment', () => {
    expect(component.env).toEqual(environment);
  });
}); 