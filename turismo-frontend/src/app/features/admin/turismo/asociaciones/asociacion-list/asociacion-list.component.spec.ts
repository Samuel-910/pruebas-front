import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  RouterTestingModule,
} from '@angular/router/testing';
import { Router } from '@angular/router';

import { AsociacionListComponent } from './asociacion-list.component';
import {
  TurismoService,
  PaginatedResponse,
  Asociacion,
} from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';

/* -------------------------------------------------------------------
 *  Dobles de prueba
 * ------------------------------------------------------------------*/
class MockTurismoService {
  private asociaciones$ = new Subject<
    PaginatedResponse<Asociacion>
  >();

  getAsociaciones = jasmine
    .createSpy()
    .and.callFake(() => this.asociaciones$.asObservable());

  deleteAsociacion = jasmine
    .createSpy()
    .and.returnValue(of(void 0));

  /** helper para emitir la respuesta de paginación */
  emitAsociaciones(p: PaginatedResponse<Asociacion>) {
    this.asociaciones$.next(p);
  }
}

class MockThemeService {
  isDarkMode() {
    return false;
  }
}

/* -------------------------------------------------------------------
 *  Datos de prueba
 * ------------------------------------------------------------------*/
const fakeAsociaciones: Asociacion[] = [
  {
    id: 1,
    nombre: 'Asociación 1',
    descripcion: 'Desc 1',
    estado: true,
    imagen_url: null,
  } as unknown as Asociacion,
  {
    id: 2,
    nombre: 'Asociación 2',
    descripcion: 'Desc 2',
    estado: false,
    imagen_url: null,
  } as unknown as Asociacion,
];

const fakePagination: PaginatedResponse<Asociacion> = {
  current_page: 1,
  data: fakeAsociaciones,
  from: 1,
  to: 2,
  total: 2,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
  links: [
    { url: null, label: '&laquo; Previous', active: false },
    { url: 'http://localhost?page=1', label: '1', active: true },
    { url: null, label: 'Next &raquo;', active: false },
  ],
} as unknown as PaginatedResponse<Asociacion>;

/* ===================================================================
 *  Suite
 * ==================================================================*/
describe('AsociacionListComponent', () => {
  let fixture: ComponentFixture<AsociacionListComponent>;
  let component: AsociacionListComponent;
  let service: MockTurismoService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AsociacionListComponent, // componente standalone
      ],
      providers: [
        { provide: TurismoService, useClass: MockTurismoService },
        { provide: ThemeService, useClass: MockThemeService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsociacionListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TurismoService) as unknown as MockTurismoService;

    spyOn(window, 'alert').and.stub();
    spyOn(window, 'confirm').and.returnValue(true); // para confirmar eliminaciones
  });

  /* ---------------------------------------------------------------
   *  Carga inicial
   * --------------------------------------------------------------*/
  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('carga asociaciones en ngOnInit', fakeAsync(() => {
    fixture.detectChanges();          // dispara ngOnInit
    service.emitAsociaciones(fakePagination);
    tick();
    fixture.detectChanges();

    expect(service.getAsociaciones).toHaveBeenCalledWith(1, 10);
    expect(component.pagination?.data.length).toBe(2);
    expect(component.loading).toBeFalse();
  }));

  /* ---------------------------------------------------------------
   *  Paginación
   * --------------------------------------------------------------*/
  it('goToPage cambia currentPage y vuelve a cargar', fakeAsync(() => {
    fixture.detectChanges();
    service.emitAsociaciones(fakePagination);
    tick();

    spyOn(component, 'loadAsociaciones').and.callThrough();

    component.goToPage(1); // página válida (la única en fakePagination)
    expect(component.currentPage).toBe(1);
    expect(component.loadAsociaciones).toHaveBeenCalled();
  }));

  /* ---------------------------------------------------------------
   *  Borrado de una asociación
   * --------------------------------------------------------------*/
  it('deleteAsociacion llama al servicio y recarga', fakeAsync(() => {
    // 1) Espejar antes de detectChanges() para pillar la llamada inicial
    const loadSpy = spyOn(component, 'loadAsociaciones').and.callThrough();

    // 2) Dispara ngOnInit + primera carga
    fixture.detectChanges();
    service.emitAsociaciones(fakePagination);
    tick();
    expect(loadSpy).toHaveBeenCalledTimes(1);

    // 3) Llamada al método de borrado
    component.deleteAsociacion(fakeAsociaciones[0]);
    tick(); // espera a que termine el delete y se recargue

    // 4) Verificaciones
    expect(service.deleteAsociacion).toHaveBeenCalledWith(1);
    expect(loadSpy).toHaveBeenCalledTimes(2);
  }));


  /* ---------------------------------------------------------------
   *  Utilidades
   * --------------------------------------------------------------*/
  it('isValidPageNumber valida correctamente', () => {
    expect(component.isValidPageNumber('3')).toBeTrue();
    expect(component.isValidPageNumber('hola')).toBeFalse();
  });

  it('getAsociacionInitials genera iniciales', () => {
    expect(component.getAsociacionInitials('Turismo Andino')).toBe('TA');
    expect(component.getAsociacionInitials('UniNombre')).toBe('U');
  });
});
