// general-header.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GeneralHeaderComponent } from './general-header.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { of, throwError, Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('GeneralHeaderComponent', () => {
  let component: GeneralHeaderComponent;
  let fixture: ComponentFixture<GeneralHeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let carritoService: jasmine.SpyObj<CarritoService>;
  let routerEvents$: Subject<any>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'logout']);
    themeService = jasmine.createSpyObj('ThemeService', ['initializeTheme', 'toggleDarkMode', 'isDarkMode']);
    carritoService = jasmine.createSpyObj('CarritoService', ['inicializarCarrito', 'limpiarCarritoAlCerrarSesion', 'getTotalItems', 'tieneItems']);

    routerEvents$ = new Subject<NavigationEnd>();

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule.withRoutes([]), GeneralHeaderComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ThemeService, useValue: themeService },
        { provide: CarritoService, useValue: carritoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralHeaderComponent);
    component = fixture.componentInstance;

    // Spy on router.events
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'events', 'get').and.returnValue(routerEvents$);
  });

  it('should create and initialize theme and carrito if logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();

    expect(themeService.initializeTheme).toHaveBeenCalled();
    expect(carritoService.inicializarCarrito).toHaveBeenCalled();
  });

  it('should subscribe to router events and reset scrolled and close mobile', fakeAsync(() => {
    authService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    component.scrolled.set(true);
    component.mobileMenuOpen.set(true);

    routerEvents$.next(new NavigationEnd(1, '/a', '/b'));
    tick();

    expect(component.scrolled()).toBeFalse();
    expect(component.mobileMenuOpen()).toBeFalse();
  }));

  it('should update scrolled on window scroll', () => {
    window.scrollY = 20;
    window.dispatchEvent(new Event('scroll'));
    expect(component.scrolled()).toBeTrue();

    window.scrollY = 0;
    window.dispatchEvent(new Event('scroll'));
    expect(component.scrolled()).toBeFalse();
  });

  it('toggleMobileMenu toggles state', () => {
    expect(component.mobileMenuOpen()).toBeFalse();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeTrue();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });



  it('toggleDarkMode delegates to themeService', () => {
    fixture.detectChanges();
    component.toggleDarkMode();
    expect(themeService.toggleDarkMode).toHaveBeenCalled();
  });

  it('getTotalItemsCarrito returns number from service', () => {
    carritoService.getTotalItems.and.returnValue(5);
    expect(component.getTotalItemsCarrito()).toBe(5);
  });

  it('hasNewChatMessages returns false by default', () => {
    expect(component.hasNewChatMessages()).toBeFalse();
  });
});
