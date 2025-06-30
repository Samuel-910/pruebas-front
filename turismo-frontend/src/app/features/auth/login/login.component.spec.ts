import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Dummy stub para el botón de Google
@Component({
  selector: 'google-login-button',
  standalone: true,
  template: ''
})
class DummyGoogleLoginButtonComponent {}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;

  // Mocks
  const queryParams$ = new Subject<any>();
  const mockActivatedRoute = { queryParams: queryParams$.asObservable() };

  const mockAuthService = {
    login: jasmine.createSpy('login').and.returnValue(of({ email_verified: true })),
    loadUserProfile: jasmine.createSpy('loadUserProfile').and.returnValue(of(null)),
    handlePostLoginRedirectWithParams: jasmine.createSpy('handlePostLoginRedirectWithParams'),
    resendVerificationEmail: jasmine.createSpy('resendVerificationEmail').and.returnValue(of({}))
  };
  const mockGoogleAuthService = {
    initGoogleOneTap: jasmine.createSpy('initGoogleOneTap')
  };
  const mockThemeService = {
    toggleDarkMode: jasmine.createSpy('toggleDarkMode'),
    isDarkMode: jasmine.createSpy('isDarkMode').and.returnValue(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        DummyGoogleLoginButtonComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create and init Google OneTap', () => {
    expect(component).toBeTruthy();
    expect(mockGoogleAuthService.initGoogleOneTap).toHaveBeenCalledWith(false);
  });

  it('should not call login if form invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    mockAuthService.login.calls.reset();

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should login & redirect when email is verified', fakeAsync(() => {
    mockAuthService.login.and.returnValue(of({ email_verified: true } as any));
    mockAuthService.loadUserProfile.and.returnValue(of({ name: 'X', email: 'x@y.com', phone: '123' }));

    component.loginForm.setValue({ email: 'a@b.com', password: 'pwd' });
    component.onSubmit();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pwd' });
    expect(mockAuthService.loadUserProfile).toHaveBeenCalledWith(true);
    expect(mockAuthService.handlePostLoginRedirectWithParams)
      .toHaveBeenCalledWith(router, mockActivatedRoute as any);
  }));

  it('should flag unverified email', fakeAsync(() => {
    mockAuthService.login.and.returnValue(of({ email_verified: false } as any));

    component.loginForm.setValue({ email: 'u@u.com', password: 'pass' });
    component.onSubmit();
    tick();

    expect(component.emailVerificationNeeded).toBeTrue();
    expect(component.error).toContain('verifica tu correo');
  }));

  it('should handle login error', fakeAsync(() => {
    mockAuthService.login.and.returnValue(throwError(() => ({ error: { message: 'bad' } })));

    component.loginForm.setValue({ email: 'e@e.com', password: 'p' });
    component.onSubmit();
    tick();

    expect(component.error).toBe('bad');
  }));

  // --- PRUEBA CORREGIDA SIN fakeAsync/ tick() ---
  it('should resend verification email correctly', () => {
    component.loginForm.get('email')!.setValue('r@r.com');
    spyOn(window, 'alert');
    mockAuthService.resendVerificationEmail.and.returnValue(of({}));

    component.resendVerificationEmail();

    expect(mockAuthService.resendVerificationEmail).toHaveBeenCalled();
    expect(component.emailVerificationNeeded).toBeTrue();
    expect(window.alert).toHaveBeenCalledWith(
      'Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.'
    );
  });

  it('should show error if resend without email', () => {
    component.loginForm.get('email')!.setValue('');
    component.resendVerificationEmail();
    expect(component.error).toBe('Por favor, ingresa tu correo electrónico.');
  });

  it('should handle resend email error', () => {
    spyOn(window, 'alert');
    mockAuthService.resendVerificationEmail.and.returnValue(
      throwError(() => ({ error: { message: 'fail' } }))
    );
    component.loginForm.get('email')!.setValue('x@x.com');

    component.resendVerificationEmail();

    expect(component.error).toBe('fail');
  });

  it('togglePasswordVisibility flips flag', () => {
    const before = component.showPassword;
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(!before);
  });

  it('toggleDarkMode & isDarkMode proxy to ThemeService', () => {
    component.toggleDarkMode();
    expect(mockThemeService.toggleDarkMode).toHaveBeenCalled();
    expect(component.isDarkMode()).toBeTrue();
  });
});