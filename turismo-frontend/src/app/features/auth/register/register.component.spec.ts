// register.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent, MustMatch } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { AuthResponse, RegisterRequest, User } from '../../../core/models/user.model';
import { RouterTestingModule } from '@angular/router/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let googleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let router: Router;
  let activatedRouteMock: { queryParams: any };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '123456789',
    country: 'a',
    birth_date: 'a',
    address: 'a',
    gender: 'a',
    preferred_language: 'a',
    roles: []
  };

  const fakeAuthResponse: AuthResponse = {
    access_token: 'fake-token',
    token_type: 'Bearer',
    expires_in: 3600,
    user: mockUser
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register', 'loadUserProfile']);
    googleAuthService = jasmine.createSpyObj('GoogleAuthService', ['initGoogleOneTap']);
    themeService = jasmine.createSpyObj('ThemeService', ['toggleDarkMode', 'isDarkMode']);
    activatedRouteMock = { queryParams: of({}) };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        RegisterComponent  // componente standalone
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authService },
        { provide: GoogleAuthService, useValue: googleAuthService },
        { provide: ThemeService, useValue: themeService },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required fields', () => {
    const f = component.registerForm.controls;
    expect(f['name']).toBeDefined();
    expect(f['email']).toBeDefined();
    expect(f['password']).toBeDefined();
  });

  it('should validate email format', () => {
    const email = component.registerForm.controls['email'];
    email.setValue('bad');
    expect(email.valid).toBeFalse();
    email.setValue('good@example.com');
    expect(email.valid).toBeTrue();
  });

  it('should validate password length', () => {
    const pwd = component.registerForm.controls['password'];
    pwd.setValue('short');
    expect(pwd.valid).toBeFalse();
    pwd.setValue('longenough');
    expect(pwd.valid).toBeTrue();
  });


  describe('onFileChange()', () => {
    it('accepts a valid image', () => {
      const file = new File([''], 'pic.jpg', { type: 'image/jpeg' });
      const evt = { target: { files: [file] } } as any;
      component.onFileChange(evt);
      expect(component.selectedFile).toBe(file);
      expect(component.fileError).toBe('');
    });

    it('rejects non-image', () => {
      const file = new File([''], 'doc.pdf', { type: 'application/pdf' });
      const evt = { target: { files: [file] } } as any;
      component.onFileChange(evt);
      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toBe('El archivo debe ser una imagen.');
    });

    it('rejects too large', () => {
      const file = new File([''], 'big.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });
      const evt = { target: { files: [file] } } as any;
      component.onFileChange(evt);
      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toBe('La imagen no debe superar los 5MB.');
    });
  });

  describe('onSubmit()', () => {
    beforeEach(() => {
      component.registerForm.setValue({
        name: 'U',
        email: 'u@e.com',
        phone: '123',
        country: '',
        birth_date: '',
        address: '',
        gender: '',
        preferred_language: '',
        password: 'password123',
        password_confirmation: 'password123'
      });
    });


    it('handles success', fakeAsync(() => {
      authService.register.and.returnValue(of(fakeAuthResponse));
      component.onSubmit();
      tick();
      expect(component.registrationSuccess).toBeTrue();
      expect(component.loading).toBeFalse();
      expect(component.registerForm.pristine).toBeTrue();
    }));

  });

  describe('Google token handling', () => {
    it('navigates on valid token', fakeAsync(() => {
      activatedRouteMock.queryParams = of({ token: 'gt' });
      authService.loadUserProfile.and.returnValue(of(mockUser));
      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      expect(localStorage.getItem('auth_token')).toBe('gt');
      expect(authService.loadUserProfile).toHaveBeenCalledWith(true);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('shows error if profile load fails', fakeAsync(() => {
      activatedRouteMock.queryParams = of({ token: 'gt' });
      authService.loadUserProfile.and.returnValue(throwError(() => ({})));
      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      expect(component.error).toBe('Error al cargar perfil tras inicio con Google.');
    }));
  });

  describe('UI interactions', () => {
    it('toggles password visibility', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTrue();
    });

    it('toggles confirm password visibility', () => {
      expect(component.showConfirmPassword).toBeFalse();
      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBeTrue();
    });

    it('navigates to login', () => {
      component.navigateToLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('toggles dark mode', () => {
      component.toggleDarkMode();
      expect(themeService.toggleDarkMode).toHaveBeenCalled();
      themeService.isDarkMode.and.returnValue(true);
      expect(component.isDarkMode()).toBeTrue();
    });

    it('prevents propagation', () => {
      const ev = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
      component.preventPropagation(ev);
      expect(ev.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('HostListener document:click', () => {
    it('ignores first click', () => {
      component.onDocumentClick(new MouseEvent('click'));
      expect(router.navigate).not.toHaveBeenCalled();
    });
    it('does not navigate when clicking inside modal', () => {
      component.onDocumentClick(new MouseEvent('click'));
      const fakeEl = { contains: () => true } as any;
      spyOn(document, 'querySelector').and.returnValue(fakeEl);
      component.onDocumentClick(new MouseEvent('click'));
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});

// Tests unitarios puros para el validador MustMatch
describe('MustMatch', () => {
  it('validates matching passwords', () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      password: ['test123'],
      confirmPassword: ['test123']
    }, { validators: MustMatch('password', 'confirmPassword') });
    expect(formGroup.valid).toBeTrue();
  });

  it('invalidates non-matching passwords', () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      password: ['test123'],
      confirmPassword: ['different']
    }, { validators: MustMatch('password', 'confirmPassword') });
    expect(formGroup.valid).toBeFalse();
    expect(formGroup.controls['confirmPassword'].errors!['mustMatch']).toBeTrue();
  });
});
