import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { FormServiciosComponent } from './form-servicios.component';
import { ServiciosService } from '../../../core/services/servicios.service';
import { TiposServicioService } from '../../../core/services/tipos-servicios.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of } from 'rxjs';

class FakeFileReader {
  result: string = '';
  onload!: (event: any) => void;
  readAsDataURL(_file: any) {
    this.result = 'data:url';
    if (this.onload) {
      // Simula el objeto de evento que tu componente espera
      this.onload({ target: this });
    }
  }
}

describe('FormServiciosComponent', () => {
  let component: FormServiciosComponent;
  let fixture: ComponentFixture<FormServiciosComponent>;
  let serviciosService: jasmine.SpyObj<ServiciosService>;
  let tiposService: jasmine.SpyObj<TiposServicioService>;
  let emprService: jasmine.SpyObj<EmprendimientoService>;
  let supabaseService: jasmine.SpyObj<SupabaseService>;
  let authService: jasmine.SpyObj<AuthService>;
  let route: ActivatedRoute;
  let router: Router;
  let swalFire: jasmine.Spy;
  let swalClose: jasmine.Spy;

  beforeEach(async () => {
    serviciosService = jasmine.createSpyObj('ServiciosService', ['crearServicio','actualizarServicio','obtenerServicio']);
    tiposService     = jasmine.createSpyObj('TiposServicioService', ['listarTiposServicio']);
    emprService      = jasmine.createSpyObj('EmprendimientoService', ['listarEmprendimientos']);
    supabaseService  = jasmine.createSpyObj('SupabaseService', ['getClient']);
    authService      = jasmine.createSpyObj('AuthService', ['getUsuarioRol']);
    route            = { snapshot: { paramMap: { get: () => null } } } as any;

    swalFire  = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ value: undefined } as any));
    swalClose = spyOn(Swal, 'close').and.callThrough();

    // Nunca ejecutamos ngAfterViewInit para no usar Leaflet:
    spyOn(FormServiciosComponent.prototype, 'ngAfterViewInit').and.callFake(() => {});

    // Reemplazamos FileReader globalmente
    (window as any).FileReader = FakeFileReader;

    await TestBed.configureTestingModule({
      imports: [
        FormServiciosComponent,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: ServiciosService,      useValue: serviciosService },
        { provide: TiposServicioService,  useValue: tiposService },
        { provide: EmprendimientoService, useValue: emprService },
        { provide: SupabaseService,       useValue: supabaseService },
        { provide: AuthService,           useValue: authService },
        { provide: ActivatedRoute,        useValue: route }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormServiciosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Configuración por defecto
    tiposService.listarTiposServicio.and.returnValue(of([]));
    emprService.listarEmprendimientos.and.returnValue(of([]));
    authService.getUsuarioRol.and.returnValue(['User']);
    supabaseService.getClient.and.returnValue({
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'http://url' } })
        })
      }
    } as any);

    fixture.detectChanges();
  });

  it('should create and initialize form and lists', () => {
    expect(component).toBeTruthy();
    expect(component.servicioForm).toBeDefined();
    expect(tiposService.listarTiposServicio).toHaveBeenCalled();
    expect(emprService.listarEmprendimientos).toHaveBeenCalled();
  });

  it('tieneRol debe retornar true si role coincide', () => {
    component.roles = ['Admin','User'];
    expect(component.tieneRol('User')).toBeTrue();
    expect(component.tieneRol(['X','Admin'])).toBeTrue();
    expect(component.tieneRol('Foo')).toBeFalse();
  });

  describe('onFileChange & removeImage', () => {
    it('debe agregar previews al cambiar archivos', () => {
      const file = new File([''], 'a.png', { type: 'image/png' });
      const event = { target: { files: [file], value: 'x' } } as any;
      component.onFileChange(event);
      expect(component.selectedFiles.length).toBe(1);
      expect(component.previewUrls).toEqual(['data:url']);
    });

    it('removeImage elimina elemento por índice', () => {
      component.selectedFiles = [{} as any, {} as any];
      component.previewUrls    = ['u1','u2'];
      component.removeImage(0);
      expect(component.selectedFiles.length).toBe(1);
      expect(component.previewUrls).toEqual(['u2']);
    });
  });

  describe('guardarServicio()', () => {
    it('si form invalid muestra error y no llama servicio', fakeAsync(() => {
      component.servicioForm.patchValue({ nombre: '' });
      component.guardarServicio();
      tick();
      expect(swalFire).toHaveBeenCalledWith('Error', jasmine.stringMatching(/Completa:/), 'error');
      expect(serviciosService.crearServicio).not.toHaveBeenCalled();
    }));

    it('crea servicio con payload y navega en success', fakeAsync(() => {
      component.servicioForm.patchValue({
        nombre:'N', descripcion:'D', precioBase:100,
        moneda:'PEN', estado:'activo', tipoServicioId:1,
        emprendimientoId:2, latitud:-15, longitud:-70
      });
      component.selectedFiles = [];
      serviciosService.crearServicio.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.guardarServicio();
      tick();

      expect(swalClose).toHaveBeenCalled();
      expect(swalFire).toHaveBeenCalledWith('Éxito', 'Servicio guardado', 'success');
      expect(router.navigate).toHaveBeenCalledWith(['/servicios']);
    }));

    it('muestra error si supabase falla', fakeAsync(() => {
      component.servicioForm.patchValue({
        nombre:'N', descripcion:'D', precioBase:0,
        moneda:'PEN', estado:'activo', tipoServicioId:1,
        emprendimientoId:2, latitud:0, longitud:0
      });
      supabaseService.getClient.and.returnValue({
        storage: { from: () => ({ upload: () => Promise.resolve({ error:{ message:'fail' } }) }) }
      } as any);
      component.selectedFiles = [ new File([''], 'x.png') ];

      component.guardarServicio();
      flush();

      expect(swalClose).toHaveBeenCalled();
      expect(swalFire).toHaveBeenCalledWith('Error', 'No se pudieron subir imágenes', 'error');
    }));
  });
});
