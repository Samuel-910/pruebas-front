// src/app/features/auth/verify-email/verify-email.component.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VerifyEmailComponent } from './verify-email.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../../environments/environments';
import { User } from '../../../core/models/user.model';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: { queryParams: any };

  beforeEach(async () => {
    // Siempre arrancamos asumiendo full-URL; lo sobreescribiremos en tests puntuales
    environment.useFullUrl = true;

    authServiceMock = jasmine.createSpyObj('AuthService', [
      'verifyEmail',
      'verifyEmailWithFullUrl',
      'isLoggedIn',
      'loadUserProfile'
    ]);
    // por defecto, simula verificación exitosa
    authServiceMock.verifyEmailWithFullUrl.and.returnValue(of({}));
    authServiceMock.verifyEmail.and.returnValue(of({}));

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteMock = {
      queryParams: of({
        id: '123',
        hash: 'abc123',
        expires: '1234567890',
        signature: 'signature123'
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        VerifyEmailComponent   // componente standalone
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router,       useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    // no detectChanges aquí: lo haremos dentro de cada it según convenga
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('inicialmente está en estado "verifying"', () => {
    // antes de ngOnInit()
    expect(component.verifying).toBeTrue();
    expect(component.success).toBeFalse();
  });

  it('ngOnInit invoca el método de verificación correcto (full URL)', fakeAsync(() => {
    // dado que environment.useFullUrl = true
    spyOn(component, 'verifyEmailWithFullUrl');
    component.ngOnInit();
    tick();
    expect(component.verifyEmailWithFullUrl).toHaveBeenCalled();
  }));

  describe('verifyEmailWithFullUrl()', () => {
    it('debe manejar un error y mostrar mensaje', fakeAsync(() => {
      const err = { error: { message: 'Token expired' } };
      authServiceMock.verifyEmailWithFullUrl.and.returnValue(throwError(() => err));

      component.ngOnInit();
      tick();

      expect(component.verifying).toBeFalse();
      expect(component.success).toBeFalse();
      expect(component.errorMessage).toBe('Token expired');
    }));

    it('si el usuario está logueado, recarga perfil', fakeAsync(() => {
      authServiceMock.verifyEmailWithFullUrl.and.returnValue(of({}));
      authServiceMock.isLoggedIn.and.returnValue(true);
      authServiceMock.loadUserProfile.and.returnValue(of({} as User));

      component.ngOnInit();
      tick();

      expect(authServiceMock.loadUserProfile).toHaveBeenCalledWith(true);
    }));
  });

  it('should handle missing id or hash', fakeAsync(() => {
    // switch a uso de params básicos
    environment.useFullUrl = false;
    // simulamos que vienen vacíos
    activatedRouteMock.queryParams = of({});

    component.ngOnInit();
    tick();

    expect(component.verifying).toBeFalse();
    expect(component.success).toBeFalse();
    expect(component.errorMessage)
      .toBe('Enlace de verificación inválido. Faltan parámetros necesarios.');
  }));

  it('debe usar verifyEmail(id, hash) cuando useFullUrl = false', fakeAsync(() => {
    environment.useFullUrl = false;
    // sólo enviamos id y hash
    activatedRouteMock.queryParams = of({ id: '123', hash: 'h' });

    const err = { error: { message: 'Invalid hash' } };
    authServiceMock.verifyEmail.and.returnValue(throwError(() => err));

    component.ngOnInit();
    tick();

    expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(123, 'h');
    expect(component.errorMessage).toBe('Invalid hash');
  }));


  it('muestra mensaje de éxito cuando verification succeeds', () => {
    component.verifying = false;
    component.success = true;
    fixture.detectChanges();
    const msg = fixture.debugElement.query(By.css('.text-green-800'));
    expect(msg.nativeElement.textContent)
      .toContain('¡Correo electrónico verificado correctamente!');
  });

});
