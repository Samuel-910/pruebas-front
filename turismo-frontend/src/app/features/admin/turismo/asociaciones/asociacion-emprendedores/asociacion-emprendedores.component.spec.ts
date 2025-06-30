import { TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';

import { AsociacionEmprendedoresComponent } from './asociacion-emprendedores.component';
import {
  TurismoService,
  Asociacion,
  Emprendedor,
} from '../../../../../core/services/turismo.service';

/* -------------------------------------------------------------------
 *  Dobles de prueba
 * ------------------------------------------------------------------*/
class MockTurismoService {
  private asociacion$ = new Subject<Asociacion>();
  private emprendedores$ = new Subject<Emprendedor[]>();

  getAsociacion = jasmine.createSpy()
    .and.callFake(() => this.asociacion$.asObservable());
  getEmprendedoresByAsociacion = jasmine.createSpy()
    .and.callFake(() => this.emprendedores$.asObservable());
  deleteEmprendedor = jasmine.createSpy().and.returnValue(of(void 0));

  emitAsociacion(a: Asociacion) { this.asociacion$.next(a); }
  emitEmprendedores(e: Emprendedor[]) { this.emprendedores$.next(e); }
}

/* -------------------------------------------------------------------
 *  Datos de prueba reutilizables
 * ------------------------------------------------------------------*/
const fakeAsociacion: Asociacion = {
  id: 1,
  nombre: 'Asociación Turística',
} as unknown as Asociacion;

const fakeEmprendedores: Emprendedor[] = [
  {
    id: 11,
    nombre: 'Juan Pérez',
    descripcion: 'Guía turístico experto', // propiedad obligatoria 👍
    email: 'juan@example.com',
    tipo_servicio: 'Guía turístico',
    ubicacion: 'Cusco',
    telefono: '999-999-999',
    pagina_web: '',
    categoria: 'Servicios',
    sliders_principales: [],
    imagenes: [],
  } as unknown as Emprendedor,
];

/* ===================================================================
 *  Suite
 * ==================================================================*/
describe('AsociacionEmprendedoresComponent', () => {
  let component: AsociacionEmprendedoresComponent;
  let fixture: ComponentFixture<AsociacionEmprendedoresComponent>;
  let service: MockTurismoService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),          // ← evita errores de RouterLink
        AsociacionEmprendedoresComponent,            // componente standalone
      ],
      providers: [
        { provide: TurismoService, useClass: MockTurismoService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AsociacionEmprendedoresComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(TurismoService) as unknown as MockTurismoService;
      });
  }));

  /* ---------------------------------------------------------------
   *  Casos
   * --------------------------------------------------------------*/
  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar asociación y emprendedores', fakeAsync(() => {
    fixture.detectChanges();                // ngOnInit

    service.emitAsociacion(fakeAsociacion);
    service.emitEmprendedores(fakeEmprendedores);
    tick();
    fixture.detectChanges();

    expect(service.getAsociacion).toHaveBeenCalledWith(1);
    expect(service.getEmprendedoresByAsociacion).toHaveBeenCalledWith(1);
    expect(component.asociacion).toEqual(fakeAsociacion);
    expect(component.emprendedores).toEqual(fakeEmprendedores);
    expect(component.loading).toBeFalse();
  }));

  it('deleteEmprendedor() elimina de la lista', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.emprendedores = [...fakeEmprendedores];
    fixture.detectChanges();

    component.deleteEmprendedor(fakeEmprendedores[0]);

    expect(service.deleteEmprendedor).toHaveBeenCalledWith(11);
    expect(component.emprendedores.length).toBe(0);
  });

  it('maneja error al cargar emprendedores', fakeAsync(() => {
    (service.getEmprendedoresByAsociacion as jasmine.Spy)
      .and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges(); // ngOnInit
    tick();

    expect(component.error).toContain('Error al cargar los emprendedores');
    expect(component.loading).toBeFalse();
  }));
});
