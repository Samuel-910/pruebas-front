// google-callback.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GoogleCallbackComponent } from './google-callback.component';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { AuthResponse, User } from '../../../core/models/user.model';
const fakeUser: User = {
  id: 1,
  name: 'Ana Torres',
  email: 'ana@example.com',
  phone: '924879525',
  // …el resto de propiedades de User
};

const fakeAuthResponse: AuthResponse = {
  access_token: 'fake-token',
  token_type: 'Bearer',
  expires_in: 3600,
  user: fakeUser
};
describe('GoogleCallbackComponent', () => {
  let component: GoogleCallbackComponent;
  let fixture: ComponentFixture<GoogleCallbackComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['handleGoogleCallback']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [GoogleCallbackComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleCallbackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  describe('with valid code parameter', () => {
    beforeEach(() => {
      mockActivatedRoute.queryParams = of({ code: 'test-code', state: 'test-state' });
      mockAuthService.handleGoogleCallback.and.returnValue(of(fakeAuthResponse));
      fixture.detectChanges();
    });


    it('should call authService with code and state', fakeAsync(() => {
      expect(mockAuthService.handleGoogleCallback).toHaveBeenCalledWith('test-state', 'test-code');
    }));

    it('should navigate to dashboard on success', fakeAsync(() => {
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));
  });

  describe('without code parameter', () => {
    beforeEach(() => {
      mockActivatedRoute.queryParams = of({});
      fixture.detectChanges();
    });

    it('should set error message', () => {
      expect(component.error).toBe('No se pudo completar la autenticación con Google. Código de autorización no encontrado.');
      expect(component.loading).toBeFalse();
    });

    it('should show error message in template', () => {
      fixture.detectChanges();
      const errorElement = fixture.debugElement.query(By.css('.text-red-800'));
      expect(errorElement.nativeElement.textContent).toContain('Error al autenticar con Google');
    });
  });

  describe('when auth service fails', () => {
    beforeEach(() => {
      mockActivatedRoute.queryParams = of({ code: 'test-code' });
      mockAuthService.handleGoogleCallback.and.returnValue(throwError(() => ({ error: { message: 'Invalid code' } })));
      fixture.detectChanges();
    });

    it('should set error message', fakeAsync(() => {
      tick();
      expect(component.error).toBe('Invalid code');
      expect(component.loading).toBeFalse();
    }));

    it('should show error message in template', fakeAsync(() => {
      tick();
      fixture.detectChanges();
      const errorElement = fixture.debugElement.query(By.css('.text-red-700'));
      expect(errorElement.nativeElement.textContent).toContain('Invalid code');
    }));
  });

  describe('when auth service fails with no message', () => {
    beforeEach(() => {
      mockActivatedRoute.queryParams = of({ code: 'test-code' });
      mockAuthService.handleGoogleCallback.and.returnValue(throwError(() => ({})));
      fixture.detectChanges();
    });

    it('should set default error message', fakeAsync(() => {
      tick();
      expect(component.error).toBe('Ocurrió un error durante la autenticación con Google.');
    }));
  });

  describe('navigateToLogin()', () => {
    it('should navigate to login page', () => {
      component.navigateToLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('DOM rendering', () => {

    it('should hide loading spinner when not loading', () => {
      component.loading = false;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.animate-spin'))).toBeNull();
    });

    it('should show error section when error exists', () => {
      component.error = 'Test error';
      component.loading = false;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.bg-red-50'))).toBeTruthy();
    });

  });
});