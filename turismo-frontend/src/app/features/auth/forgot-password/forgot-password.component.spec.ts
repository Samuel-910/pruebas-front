import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['forgotPassword']);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleDarkMode', 'isDarkMode']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        ForgotPasswordComponent
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty email', () => {
    expect(component.forgotForm.value.email).toBe('');
  });

  it('should mark form as invalid if email is empty', () => {
    component.forgotForm.setValue({ email: '' });
    expect(component.forgotForm.invalid).toBeTrue();
  });

  it('should mark form as invalid if email is not valid', () => {
    component.forgotForm.setValue({ email: 'invalid-email' });
    expect(component.forgotForm.invalid).toBeTrue();
  });

  it('should submit form and call AuthService if email is valid', fakeAsync(() => {
    const testEmail = 'test@example.com';
    component.forgotForm.setValue({ email: testEmail });

    mockAuthService.forgotPassword.and.returnValue(of({ message: 'OK' }));

    component.onSubmit();
    tick();

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(testEmail);
    expect(component.emailSent).toBeTrue();
    expect(component.loading).toBeFalse();
  }));

  it('should handle error on AuthService.forgotPassword', fakeAsync(() => {
    const testEmail = 'fail@example.com';
    component.forgotForm.setValue({ email: testEmail });

    mockAuthService.forgotPassword.and.returnValue(
      throwError(() => ({
        error: { message: 'Error simulado' }
      }))
    );

    component.onSubmit();
    tick();

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(testEmail);
    expect(component.emailSent).toBeFalse();
    expect(component.error).toBe('Error simulado');
    expect(component.loading).toBeFalse();
  }));
});