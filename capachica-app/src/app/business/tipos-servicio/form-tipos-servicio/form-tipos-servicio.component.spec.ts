import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormTiposServicioComponent } from './form-tipos-servicio.component';
import { TiposServicioService } from '../../../core/services/tipos-servicios.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('FormTiposServicioComponent', () => {
  let component: FormTiposServicioComponent;
  let fixture: ComponentFixture<FormTiposServicioComponent>;
  let tiposService: jasmine.SpyObj<TiposServicioService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let route: ActivatedRoute;
  let swalFire: jasmine.Spy;

  beforeEach(async () => {
    tiposService = jasmine.createSpyObj('TiposServicioService', [
      'obtenerTipoServicio',
      'crearTipoServicio'
    ]);
    authService = jasmine.createSpyObj('AuthService', ['getUsuarioId', 'getUsuarioRol']);
    authService.getUsuarioId.and.returnValue(1);
    authService.getUsuarioRol.and.returnValue([]);

    swalFire = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));

    route = { snapshot: { paramMap: { get: () => null } } } as any;

    await TestBed.configureTestingModule({
      imports: [
        FormTiposServicioComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: TiposServicioService, useValue: tiposService },
        { provide: AuthService,          useValue: authService },
        { provide: ActivatedRoute,       useValue: route }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormTiposServicioComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.tipoServicioForm).toBeDefined();
    expect(component.isEdit).toBeFalse();
    expect(component.tipoServicioIdEdit).toBeNull();
  });

  it('ngOnInit with id sets edit mode and patches form', fakeAsync(() => {
    (route.snapshot.paramMap.get as jasmine.Spy) = jasmine.createSpy().and.returnValue('5');
    const mock = { nombre: 'X', descripcion: 'Y', requiereCupo: true };
    tiposService.obtenerTipoServicio.and.returnValue(of(mock));

    fixture = TestBed.createComponent(FormTiposServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(component.isEdit).toBeTrue();
    expect(component.tipoServicioIdEdit).toBe(5);
    expect(component.tipoServicioForm.value).toEqual({
      nombre: 'X',
      descripcion: 'Y',
      requiereCupo: true
    });
  }));

  it('guardarTipoServicio invalid shows error and does not call service', () => {
    component.tipoServicioForm.patchValue({ nombre: '', descripcion: '', requiereCupo: false });
    component.guardarTipoServicio();
    expect(swalFire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Formulario incompleto',
      html: jasmine.stringMatching(/Por favor corrige o completa/)
    });
    expect(tiposService.crearTipoServicio).not.toHaveBeenCalled();
  });

  it('guardarTipoServicio new valid calls crear and navigates', fakeAsync(() => {
    component.tipoServicioForm.patchValue({ nombre: 'A', descripcion: 'B', requiereCupo: false });
    tiposService.crearTipoServicio.and.returnValue(of({}));
    const navSpy = spyOn(router, 'navigate');

    component.guardarTipoServicio();
    tick();

    expect(tiposService.crearTipoServicio).toHaveBeenCalledWith({
      nombre: 'A',
      descripcion: 'B',
      requiereCupo: false
    });
    expect(swalFire).toHaveBeenCalledWith('Registrado', 'El tipo de servicio fue registrado correctamente.', 'success');
    expect(navSpy).toHaveBeenCalledWith(['/tipos-servicio']);
  }));

  it('guardarTipoServicio edit valid calls crear and navigates', fakeAsync(() => {
    component.isEdit = true;
    component.tipoServicioIdEdit = 7;
    component.tipoServicioForm.patchValue({ nombre: 'A', descripcion: 'B', requiereCupo: true });
    tiposService.crearTipoServicio.and.returnValue(of({}));
    const navSpy = spyOn(router, 'navigate');

    component.guardarTipoServicio();
    tick();

    expect(tiposService.crearTipoServicio).toHaveBeenCalledWith({
      nombre: 'A',
      descripcion: 'B',
      requiereCupo: true
    });
    expect(swalFire).toHaveBeenCalledWith('Actualizado', 'El tipo de servicio fue actualizado correctamente.', 'success');
    expect(navSpy).toHaveBeenCalledWith(['/tipos-servicio']);
  }));

  it('guardarTipoServicio error calls error dialog', fakeAsync(() => {
    component.tipoServicioForm.patchValue({ nombre: 'A', descripcion: 'B', requiereCupo: false });
    tiposService.crearTipoServicio.and.returnValue(throwError(() => new Error('fail')));

    component.guardarTipoServicio();
    tick();

    expect(swalFire).toHaveBeenCalledWith('Error', 'No se pudo registrar el tipo de servicio.', 'error');
  }));

  it('cancelar navigates back', () => {
    const navSpy = spyOn(router, 'navigate');
    component.cancelar();
    expect(navSpy).toHaveBeenCalledWith(['/tipos-servicio']);
  });
});
