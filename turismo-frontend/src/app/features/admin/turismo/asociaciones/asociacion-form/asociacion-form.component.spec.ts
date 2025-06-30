import {
  TestBed,
  ComponentFixture,
  waitForAsync,
  fakeAsync,
  tick,
  flushMicrotasks,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import {
  RouterTestingModule,
} from '@angular/router/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
} from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AsociacionFormComponent } from './asociacion-form.component';
import {
  TurismoService,
  Municipalidad,
  Asociacion,
} from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';

/* -------------------------------------------------------------------
 *  Dobles de prueba
 * ------------------------------------------------------------------*/
class MockTurismoService {
  private municipalidades$ = new Subject<Municipalidad[]>();
  private asociacion$      = new Subject<Asociacion>();

  getMunicipalidades = jasmine
    .createSpy()
    .and.callFake(() => this.municipalidades$.asObservable());

  getAsociacion = jasmine
    .createSpy()
    .and.callFake(() => this.asociacion$.asObservable());

  createAsociacion = jasmine.createSpy().and.returnValue(of(void 0));
  updateAsociacion = jasmine.createSpy().and.returnValue(of(void 0));

  emitMunicipalidades(list: Municipalidad[]) {
    this.municipalidades$.next(list);
  }
  emitAsociacion(a: Asociacion) {
    this.asociacion$.next(a);
  }
}

class MockThemeService {
  isDarkMode(): boolean {
    return false;
  }
}

/* -------------------------------------------------------------------
 *  Datos de prueba reutilizables
 * ------------------------------------------------------------------*/
const fakeMunicipalidades: Municipalidad[] = [
  { id: 1, nombre: 'Municipalidad A' } as unknown as Municipalidad,
  { id: 2, nombre: 'Municipalidad B' } as unknown as Municipalidad,
];

const fakeAsociacion: Asociacion = {
  id:               10,
  nombre:           'Asociación de Turismo',
  descripcion:      'Una descripción',
  municipalidad_id: 2,
  telefono:         '999999999',
  email:            'info@test.com',
  estado:           true,
  latitud:          -12.04,
  longitud:         -77.03,
  imagen_url:       'http://example.com/img.jpg',
} as unknown as Asociacion;

/* ===================================================================
 *  Suite
 * ==================================================================*/
describe('AsociacionFormComponent', () => {
  let fixture  : ComponentFixture<AsociacionFormComponent>;
  let component: AsociacionFormComponent;
  let service  : MockTurismoService;
  let router   : Router;

  /** util para stub de ActivatedRoute */
  function routeStub(id: string | null) {
    return { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } };
  }

  /** crea TestBed con modo create / edit ---------------------------*/
  function setup(id: string | null) {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        AsociacionFormComponent,
      ],
      providers: [
        { provide: TurismoService, useClass: MockTurismoService },
        { provide: ThemeService,  useClass: MockThemeService },
        { provide: ActivatedRoute, useValue: routeStub(id) },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(AsociacionFormComponent);
    component = fixture.componentInstance;
    service   = TestBed.inject(TurismoService) as unknown as MockTurismoService;
    router    = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub();
    spyOn(window, 'alert').and.stub();     // evita diálogos reales
  }

  /* ---------------------------------------------------------------
   *  Tests en modo CREAR
   * --------------------------------------------------------------*/
  describe('modo crear', () => {
    beforeEach(waitForAsync(() => setup(null)));

    it('debe crearse', () => expect(component).toBeTruthy());

    it('carga municipalidades y mantiene form inválido sin datos', fakeAsync(() => {
      fixture.detectChanges();          // ngOnInit
      service.emitMunicipalidades(fakeMunicipalidades);
      tick();

      expect(service.getMunicipalidades).toHaveBeenCalled();
      expect(component.municipalidades.length).toBe(2);
      expect(component.asociacionForm.valid).toBeFalse();
    }));

    it('isFieldInvalid detecta error de nombre', () => {
      fixture.detectChanges();
      const control: AbstractControl = component.asociacionForm.get('nombre')!;
      control.markAsTouched();
      expect(component.isFieldInvalid('nombre')).toBeTrue();
    });

    it('onSubmit llama a createAsociacion con datos válidos', fakeAsync(() => {
      fixture.detectChanges();
      service.emitMunicipalidades(fakeMunicipalidades);
      tick();

      component.asociacionForm.patchValue({
        nombre:           'Nueva',
        descripcion:      'Desc',
        municipalidad_id: 1,
      });
      component.onSubmit();

      expect(service.createAsociacion).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/admin/asociaciones']);
    }));
  });

  /* ---------------------------------------------------------------
   *  Tests en modo EDICIÓN
   * --------------------------------------------------------------*/
  describe('modo edición', () => {
    beforeEach(waitForAsync(() => setup('10')));

    it('parchea el formulario y carga imagen', fakeAsync(() => {
      fixture.detectChanges();
      service.emitMunicipalidades(fakeMunicipalidades);
      service.emitAsociacion(fakeAsociacion);
      tick();
      fixture.detectChanges();

      expect(service.getAsociacion).toHaveBeenCalledWith(10);
      expect(component.asociacionForm.value.nombre).toBe(fakeAsociacion.nombre);
      /* --- comparación flexible para evitar el prefijo unsafe: --- */
      expect(component.previewImage).toContain(fakeAsociacion.imagen_url);
    }));

    it('onSubmit llama a updateAsociacion', fakeAsync(() => {
      fixture.detectChanges();
      service.emitMunicipalidades(fakeMunicipalidades);
      service.emitAsociacion(fakeAsociacion);
      tick();

      component.asociacionForm.patchValue({ nombre: 'Actualizado' });
      component.onSubmit();

      expect(service.updateAsociacion).toHaveBeenCalledWith(
        10,
        jasmine.objectContaining({ nombre: 'Actualizado' })
      );
    }));
  });

});
