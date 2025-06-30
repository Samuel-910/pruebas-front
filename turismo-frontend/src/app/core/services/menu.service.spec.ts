import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MenuService, MenuItem } from './menu.service';
import { environment } from '../../../environments/environments';

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  const mockMenu: MenuItem[] = [
    { id: 'home', title: 'Inicio', path: '/home', icon: 'home' },
    { id: 'settings', title: 'Configuración', path: '/settings', icon: 'settings' }
  ];

  const defaultMenu: MenuItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'profile', title: 'Mi Perfil', icon: 'user', path: '/profile' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MenuService]
    });

    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.resetMenu();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadMenu', () => {
    it('should load menu items from API and set menuLoaded true', fakeAsync(() => {
      let response: MenuItem[] = [];

      service.loadMenu().subscribe(menu => {
        response = menu;
      });

      const req = httpMock.expectOne(`${apiUrl}/menu`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockMenu });

      tick();

      expect(response).toEqual(mockMenu);
      expect(service.getMenuItems()).toEqual(mockMenu);
    }));

    it('should return cached menu if already loaded', fakeAsync(() => {
      let firstResponse: MenuItem[] = [];
      let secondResponse: MenuItem[] = [];

      // Primera carga (API)
      service.loadMenu().subscribe(menu => {
        firstResponse = menu;
      });

      const req = httpMock.expectOne(`${apiUrl}/menu`);
      req.flush({ success: true, data: mockMenu });

      tick();
      expect(firstResponse).toEqual(mockMenu);
      expect(service.getMenuItems()).toEqual(mockMenu);

      // Segunda carga (desde cache)
      service.loadMenu().subscribe(menu => {
        secondResponse = menu;
      });

      tick();
      expect(secondResponse).toEqual(mockMenu);
    }));

    it('should fallback to default menu on error', fakeAsync(() => {
      let response: MenuItem[] = [];

      service.loadMenu().subscribe(menu => {
        response = menu;
      });

      const req = httpMock.expectOne(`${apiUrl}/menu`);
      req.error(new ErrorEvent('Network error'), { status: 500 });

      tick();

      expect(response).toEqual(defaultMenu);
      expect(service.getMenuItems()).toEqual(defaultMenu);
    }));
  });

  describe('getMenuItems', () => {
    it('should return current menu items', () => {
      (service as any).menuItemsSubject.next(mockMenu);
      expect(service.getMenuItems()).toEqual(mockMenu);
    });
  });

  describe('getFirstAccessibleRoute', () => {
    it('should return first path if menu has items', () => {
      (service as any).menuItemsSubject.next(mockMenu);
      const route = service.getFirstAccessibleRoute();
      expect(route).toBe('/home');
    });

    it('should return default route if menu is empty', () => {
      (service as any).menuItemsSubject.next([]);
      const route = service.getFirstAccessibleRoute();
      expect(route).toBe('/dashboard');
    });
  });

  describe('resetMenu', () => {
    it('should reset menu state', () => {
      (service as any).menuItemsSubject.next(mockMenu);
      (service as any).menuLoaded = true;

      service.resetMenu();

      expect(service.getMenuItems()).toEqual([]);
      expect((service as any).menuLoaded).toBeFalse();
    });
  });
});
