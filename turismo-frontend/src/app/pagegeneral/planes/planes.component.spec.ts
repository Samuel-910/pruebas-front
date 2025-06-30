import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { PlanesComponent } from './planes.component';
import { PlanesService } from '../../../app/core/services/planes.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { PaginatedResponse } from '../../core/models/api.model';
import { Plan, PlanFiltros } from '../../../app/core/models/plan.model';
import { DebugElement } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environments';

describe('PlanesComponent', () => {
  let component: PlanesComponent;
  let fixture: ComponentFixture<PlanesComponent>;
  let planesServiceSpy: jasmine.SpyObj<PlanesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPlan: Plan = {
    id: 1,
    nombre: 'Plan Turístico Capachica',
    descripcion: 'Descripción del plan turístico en Capachica',
    duracion_dias: 3,
    precio_total: 1500,
    dificultad: 'moderado',
    estado: 'activo',
    capacidad: 10,
    cupos_disponibles: 5,
    imagen_principal_url: '/images/plan1.jpg',
    organizador_principal: {
      id: 1,
      nombre: 'Familia Huanca',
      ubicacion: 'Capachica, Puno',
      telefono: '123456789',
      email: 'familia@capachica.com'
    }
  };

  const mockPaginatedResponse: PaginatedResponse<Plan> = {
    current_page: 1,
    first_page_url: '/api/planes?page=1',
    last_page: 3,
    last_page_url: '/api/planes?page=3',
    next_page_url: '/api/planes?page=2',
    prev_page_url: null,
    from: 1,
    to: 9,
    total: 25,
    links: [
      { url: null, label: '&laquo; Previous', active: false },
      { url: '/api/planes?page=1', label: '1', active: true },
      { url: '/api/planes?page=2', label: '2', active: false },
      { url: '/api/planes?page=3', label: '3', active: false },
      { url: '/api/planes?page=2', label: 'Next &raquo;', active: false }
    ],
    path: '/api/planes',
    per_page: 9,
    data: [mockPlan]
  };

  beforeEach(() => {
    const planesSpy = jasmine.createSpyObj('PlanesService', ['getPlanesPublicos']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getCurrentUser']);
    const themeSpy = jasmine.createSpyObj('ThemeService', ['isDarkMode', 'toggleTheme']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({}),
      queryParams: of({}),
      snapshot: { params: {}, queryParams: {} }
    });

    TestBed.configureTestingModule({
      imports: [PlanesComponent],
      providers: [
        { provide: PlanesService, useValue: planesSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ThemeService, useValue: themeSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanesComponent);
    component = fixture.componentInstance;
    planesServiceSpy = TestBed.inject(PlanesService) as jasmine.SpyObj<PlanesService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    themeServiceSpy = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Configurar valores por defecto para los spies
    themeServiceSpy.isDarkMode.and.returnValue(false);
    authServiceSpy.isLoggedIn.and.returnValue(true);
  });

  describe('Inicialización del componente', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading()).toBeFalse();
      expect(component.error()).toBe('');
      expect(component.paginatedPlanes()).toBeNull();
      expect(component.filtros().buscar).toBe('');
      expect(component.filtros().dificultad).toBe('');
      expect(component.filtros().con_cupos).toBeTrue();
      expect(component.filtros().per_page).toBe(9);
      expect(component.filtros().page).toBe(1);
    });

    it('should load plans on init', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));

      fixture.detectChanges();
      tick();

      expect(planesServiceSpy.getPlanesPublicos).toHaveBeenCalledWith({
        buscar: '',
        dificultad: '',
        duracion_max: undefined,
        con_cupos: true,
        per_page: 9,
        page: 1
      });
      expect(component.paginatedPlanes()).toEqual(mockPaginatedResponse);
      expect(component.loading()).toBeFalse();
      expect(component.error()).toBe('');
    }));
  });

  describe('Manejo de errores', () => {
    it('should handle error when loading plans', fakeAsync(() => {
      const errorMessage = 'Error de conexión';
      planesServiceSpy.getPlanesPublicos.and.returnValue(throwError(() => new Error(errorMessage)));

      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('Error al cargar los planes. Por favor, intenta nuevamente.');
      expect(component.loading()).toBeFalse();
      expect(component.paginatedPlanes()).toBeNull();
    }));

    it('should retry loading plans when error occurs', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(throwError(() => new Error('Error inicial')));
      
      fixture.detectChanges();
      tick();

      // Simular reintento exitoso
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      component.cargarPlanes();
      tick();

      expect(component.paginatedPlanes()).toEqual(mockPaginatedResponse);
      expect(component.error()).toBe('');
    }));
  });

  describe('Filtros', () => {
    it('should apply filters with debounce', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      fixture.detectChanges();
      tick();

      // Cambiar filtros
      component.filtros.set({
        ...component.filtros(),
        buscar: 'capachica',
        dificultad: 'facil'
      });

      component.onFiltroChange();
      tick(500); // Esperar el debounce

      expect(planesServiceSpy.getPlanesPublicos).toHaveBeenCalledWith({
        buscar: 'capachica',
        dificultad: 'facil',
        duracion_max: undefined,
        con_cupos: true,
        per_page: 9,
        page: 1
      });
    }));

    it('should clear filters correctly', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      // Establecer filtros
      component.filtros.set({
        buscar: 'test',
        dificultad: 'dificil',
        duracion_max: 7,
        con_cupos: false,
        per_page: 9,
        page: 1
      });

      component.limpiarFiltros();
      tick();

      expect(component.filtros().buscar).toBe('');
      expect(component.filtros().dificultad).toBe('');
      expect(component.filtros().duracion_max).toBeUndefined();
      expect(component.filtros().con_cupos).toBeTrue();
      expect(planesServiceSpy.getPlanesPublicos).toHaveBeenCalledWith({
        buscar: '',
        dificultad: '',
        duracion_max: undefined,
        con_cupos: true,
        per_page: 9,
        page: 1
      });
    }));

    it('should handle filter changes with debounce', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      fixture.detectChanges();
      tick();

      const spy = spyOn(component, 'cargarPlanes');
      
      component.onFiltroChange();
      tick(500);

      expect(spy).toHaveBeenCalledWith(1);
    }));
  });

  describe('Paginación', () => {
    it('should change page correctly', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      fixture.detectChanges();
      tick();

      const scrollToSpy = spyOn(window, 'scrollTo');
      
      component.cambiarPagina(2);
      tick();

      expect(planesServiceSpy.getPlanesPublicos).toHaveBeenCalledWith({
        buscar: '',
        dificultad: '',
        duracion_max: undefined,
        con_cupos: true,
        per_page: 9,
        page: 2
      });
      expect(scrollToSpy).toHaveBeenCalled();
    }));

    it('should not change page if page number is invalid', () => {
      const spy = spyOn(component, 'cargarPlanes');
      
      component.cambiarPagina(0);
      component.cambiarPagina(-1);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Utilidades', () => {
    it('should return correct difficulty labels', () => {
      expect(component.getDificultadLabel('facil')).toBe('Fácil');
      expect(component.getDificultadLabel('moderado')).toBe('Moderado');
      expect(component.getDificultadLabel('dificil')).toBe('Difícil');
      expect(component.getDificultadLabel('unknown')).toBe('unknown');
    });

    it('should handle image error correctly', () => {
      const event = { target: { src: 'invalid-image.jpg' } };
      
      component.onImageError(event);
      
      expect(event.target.src).toBe('/assets/images/default-plan.jpg');
    });

    it('should return dark mode status', () => {
      themeServiceSpy.isDarkMode.and.returnValue(true);
      expect(component.isDarkMode()).toBeTrue();

      themeServiceSpy.isDarkMode.and.returnValue(false);
      expect(component.isDarkMode()).toBeFalse();
    });
  });

  describe('Computed properties', () => {
    it('should return empty array when no paginated planes', () => {
      component.paginatedPlanes.set(null);
      expect(component.planes()).toEqual([]);
    });

    it('should return planes data when available', () => {
      component.paginatedPlanes.set(mockPaginatedResponse);
      expect(component.planes()).toEqual([mockPlan]);
    });
  });

  describe('Template interactions', () => {
    beforeEach(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      fixture.detectChanges();
    });

    it('should display loading state', fakeAsync(() => {
      component.loading.set(true);
      fixture.detectChanges();
      tick();

      const loadingElement = fixture.debugElement.query(By.css('.animate-spin'));
      expect(loadingElement).toBeTruthy();
    }));

    it('should display error state', fakeAsync(() => {
      component.error.set('Error de prueba');
      fixture.detectChanges();
      tick();

      const errorElement = fixture.debugElement.query(By.css('.bg-red-100'));
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain('Error de prueba');
    }));

    it('should display no results message when no plans', fakeAsync(() => {
      component.paginatedPlanes.set({
        ...mockPaginatedResponse,
        data: []
      });
      fixture.detectChanges();
      tick();

      const noResultsElement = fixture.debugElement.query(By.css('.text-xl.font-semibold'));
      expect(noResultsElement).toBeTruthy();
      expect(noResultsElement.nativeElement.textContent).toContain('No se encontraron planes');
    }));

    it('should display plans when available', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const planCards = fixture.debugElement.queryAll(By.css('.grid.gap-8'));
      expect(planCards.length).toBeGreaterThan(0);
    }));
  });

  describe('Environment configuration', () => {
    it('should have environment configuration', () => {
      expect(component.env).toBeDefined();
      expect(component.env).toEqual(environment);
    });
  });

  describe('Debounce functionality', () => {
    it('should clear previous timeout when filter changes', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      fixture.detectChanges();
      tick();

      const spy = spyOn(component, 'cargarPlanes');
      
      // Cambiar filtros múltiples veces rápidamente
      component.onFiltroChange();
      component.onFiltroChange();
      component.onFiltroChange();
      
      tick(500);

      // Solo debería llamarse una vez debido al debounce
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Edge cases', () => {
    it('should handle empty response data', fakeAsync(() => {
      const emptyResponse: PaginatedResponse<Plan> = {
        ...mockPaginatedResponse,
        data: []
      };
      
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(emptyResponse));
      
      fixture.detectChanges();
      tick();

      expect(component.planes()).toEqual([]);
      expect(component.loading()).toBeFalse();
    }));

    it('should handle null response', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(null as any));
      
      fixture.detectChanges();
      tick();

      expect(component.paginatedPlanes()).toBeNull();
      expect(component.planes()).toEqual([]);
    }));

    it('should handle undefined response', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(undefined as any));
      
      fixture.detectChanges();
      tick();

      expect(component.paginatedPlanes()).toBeUndefined();
      expect(component.planes()).toEqual([]);
    }));
  });

  describe('Service integration', () => {
    it('should call service with correct parameters', fakeAsync(() => {
      planesServiceSpy.getPlanesPublicos.and.returnValue(of(mockPaginatedResponse));
      
      fixture.detectChanges();
      tick();

      expect(planesServiceSpy.getPlanesPublicos).toHaveBeenCalledWith({
        buscar: '',
        dificultad: '',
        duracion_max: undefined,
        con_cupos: true,
        per_page: 9,
        page: 1
      });
    }));

    it('should handle service errors gracefully', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      planesServiceSpy.getPlanesPublicos.and.returnValue(throwError(() => new Error('Service error')));
      
      fixture.detectChanges();
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Error al cargar planes:', jasmine.any(Error));
    }));
  });
});
