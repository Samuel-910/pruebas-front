// emprendimiento-nav.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { EmprendimientoNavComponent } from './emprendimiento-nav.component';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { of, throwError } from 'rxjs';
import { Emprendimiento } from '../../../core/models/emprendimiento-admin.model';

describe('EmprendimientoNavComponent', () => {
  let component: EmprendimientoNavComponent;
  let fixture: ComponentFixture<EmprendimientoNavComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let emprendimientoService: jasmine.SpyObj<EmprendimientoAdminService>;
  let activatedRoute: any;
  let router: jasmine.SpyObj<Router>;

  const mockEmpr: Emprendimiento = {
    id: 42,
    nombre: 'Test Emp',
    tipo_servicio: 'Tipo',
    categoria: 'Cat',
    estado: true,
    sliders_principales: [{ url_completa: 'img1.png' }]
  } as any;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['logout']);
    emprendimientoService = jasmine.createSpyObj('EmprendimientoAdminService', ['getEmprendimiento']);
    // Ruta con paramMap id
    activatedRoute = { snapshot: { paramMap: new Map([['id', '42']]) } };
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, EmprendimientoNavComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: EmprendimientoAdminService, useValue: emprendimientoService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: router }
      ]
    })
    // Remplazamos el template para evitar errores de RouterLink
    .overrideComponent(EmprendimientoNavComponent, { set: { template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(EmprendimientoNavComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads emprendimiento when input absent', () => {
    emprendimientoService.getEmprendimiento.and.returnValue(of(mockEmpr));
    // Simular ausencia de input
    (component as any).emprendimiento = undefined;
    component.ngOnInit();
    expect(emprendimientoService.getEmprendimiento).toHaveBeenCalledWith(42);
    // Forzar el tipo para la comparación
    expect((component as any).emprendimiento).toEqual(mockEmpr);
  });

  it('setupNavigation populates navigationItems based on route id', () => {
    component.emprendimiento = mockEmpr;
    component.ngOnInit();
    expect(component.navigationItems.length).toBeGreaterThan(0);
    const info = component.navigationItems.find(i => i.label === 'Información');
    expect(info?.route).toContain('/admin-emprendedores/emprendimiento/42');
  });

  it('toggleDarkMode flips isDarkMode and writes localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.isDarkMode = false;
    component.toggleDarkMode();
    expect(component.isDarkMode).toBeTrue();
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('logout calls authService.logout and does not throw', () => {
    emprendimientoService.getEmprendimiento.and.returnValue(of(mockEmpr));
    authService.logout.and.returnValue(of({}));
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('getMainImage returns first slider url or null', () => {
    const url = component.getMainImage(mockEmpr);
    expect(url).toBe('img1.png');
    expect(component.getMainImage({ sliders_principales: [] } as any)).toBeNull();
  });
});
