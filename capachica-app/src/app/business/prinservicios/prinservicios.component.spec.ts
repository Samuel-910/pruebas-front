import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PrinserviciosComponent } from './prinservicios.component';
import { ServiciosService }       from '../../core/services/servicios.service';
import { ResenaService }          from '../../core/services/resenas.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: ''
})
class NavbarStubComponent {}

describe('PrinserviciosComponent (standalone)', () => {
  let fixture: ComponentFixture<PrinserviciosComponent>;
  let component: PrinserviciosComponent;

  const mockServiciosService = {
    listarServiciosPorTipo: jasmine
      .createSpy('listarServiciosPorTipo')
      .and.returnValue(of([{ id: 42, isFavorito: false }])),
    marcarFavorito:    jasmine.createSpy('marcarFavorito'),
    desmarcarFavorito: jasmine.createSpy('desmarcarFavorito')
  };
  const mockResenaService = {
    obtenerPromedioDeCalificacion: jasmine
      .createSpy('obtenerPromedioDeCalificacion')
      .and.returnValue(of({ promedioCalificacion: 4, totalResenas: 10 })),
    obtenerReseñas: jasmine
      .createSpy('obtenerReseñas')
      .and.returnValue(of([{ servicioId: 42, comentario: 'OK' }]))
  };
  const activatedRouteStub = {
    snapshot: { paramMap: { get: (_key: string) => '42' } }
  };
  const mockRouter = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    await TestBed
      .configureTestingModule({
        imports: [
          PrinserviciosComponent,
          NavbarStubComponent,
          CommonModule,
          HttpClientTestingModule
        ],
        providers: [
          { provide: ServiciosService, useValue: mockServiciosService },
          { provide: ResenaService,    useValue: mockResenaService },
          { provide: ActivatedRoute,   useValue: activatedRouteStub },
          { provide: Router,           useValue: mockRouter }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
      // anulamos el template para evitar errores de binding
      .overrideComponent(PrinserviciosComponent, {
        set: { template: '<ng-container></ng-container>' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrinserviciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // dispara ngOnInit()
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar servicios con calificaciones y reseñas', () => {
    expect(mockServiciosService.listarServiciosPorTipo).toHaveBeenCalledWith('42');
    expect(component.servicios.length).toBe(1);

    const serv = component.servicios[0];
    expect(serv.promedioCalificacion).toBe(4);
    expect(serv.totalResenas).toBe(10);
    expect(serv.reseñas.length).toBe(1);
    expect(serv.reseñas[0].comentario).toBe('OK');
    expect(component.isLoading).toBeFalse();
  });

  it('toggleFavorito(): debería marcar favorito en caso de éxito', fakeAsync(() => {
    const servicio = { id: 100, isFavorito: false };
    mockServiciosService.marcarFavorito.and.returnValue(of(null));

    component.toggleFavorito(servicio, new MouseEvent('click'));
    tick();

    expect(mockServiciosService.marcarFavorito).toHaveBeenCalledWith(100);
    expect(servicio.isFavorito).toBeTrue();
  }));

  it('toggleFavorito(): error al añadir favorito muestra alerta', fakeAsync(() => {
    const servicio = { id: 200, isFavorito: false };
    mockServiciosService.marcarFavorito.and.returnValue(throwError(() => new Error('fail')));
    spyOn(Swal, 'fire');

    component.toggleFavorito(servicio, new MouseEvent('click'));
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo añadir a favoritos', 'error');
    expect(servicio.isFavorito).toBeFalse();
  }));

  it('toggleFavorito(): debería desmarcar favorito en caso de éxito', fakeAsync(() => {
    const servicio = { id: 300, isFavorito: true };
    mockServiciosService.desmarcarFavorito.and.returnValue(of(null));

    component.toggleFavorito(servicio, new MouseEvent('click'));
    tick();

    expect(mockServiciosService.desmarcarFavorito).toHaveBeenCalledWith(300);
    expect(servicio.isFavorito).toBeFalse();
  }));

  it('toggleFavorito(): error al quitar favorito muestra alerta', fakeAsync(() => {
    const servicio = { id: 400, isFavorito: true };
    mockServiciosService.desmarcarFavorito.and.returnValue(throwError(() => new Error('fail')));
    spyOn(Swal, 'fire');

    component.toggleFavorito(servicio, new MouseEvent('click'));
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo quitar de favoritos', 'error');
    expect(servicio.isFavorito).toBeTrue();
  }));

  it('verDetallesServicios(): navega a la ruta correcta', () => {
    component.verDetallesServicios(99);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/serviciosdetalle/99']);
  });
});
