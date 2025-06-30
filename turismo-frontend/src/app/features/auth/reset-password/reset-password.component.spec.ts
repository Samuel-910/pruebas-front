import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ResetPasswordRequest } from '../../../core/models/user.model';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let themeServiceMock: jasmine.SpyObj<ThemeService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['resetPassword']);
    themeServiceMock = jasmine.createSpyObj('ThemeService', ['toggleDarkMode', 'isDarkMode']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    
    activatedRouteMock = {
      queryParams: of({
        token: 'test-token',
        email: 'test@example.com'
      })
    };

  await TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      FormsModule,
      RouterTestingModule.withRoutes([]),
      ResetPasswordComponent     // → standalone va en imports
    ],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: ThemeService, useValue: themeServiceMock },
      { provide: Router,        useValue: routerMock },    // ← añade esto
      { provide: ActivatedRoute,useValue: activatedRouteMock }
    ]
    // ← NO declarations!
  }).compileComponents();

  fixture = TestBed.createComponent(ResetPasswordComponent);
  component = fixture.componentInstance;
  fixture.detectChanges(); // ngOnInit parchea el form con email+token
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should populate token and email from query params on init', () => {
    expect(component.resetForm.get('email')?.value).toBe('test@example.com');
    expect(component.resetForm.get('token')?.value).toBe('test-token');
  });


  it('should validate password as required', () => {
    const passwordControl = component.resetForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate password min length', () => {
    const passwordControl = component.resetForm.get('password');
    passwordControl?.setValue('1234');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();
  });

  it('should validate password confirmation matches', () => {
    component.resetForm.get('password')?.setValue('password123');
    component.resetForm.get('password_confirmation')?.setValue('different');
    
    expect(component.resetForm.errors?.['mustMatch']).toBeUndefined(); // Our custom validator sets error on control
    expect(component.resetForm.get('password_confirmation')?.errors?.['mustMatch']).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
  });

  it('should call authService.resetPassword when form is valid', fakeAsync(() => {
    authServiceMock.resetPassword.and.returnValue(of({}));
    
    component.resetForm.get('password')?.setValue('newPassword123');
    component.resetForm.get('password_confirmation')?.setValue('newPassword123');
    
    component.onSubmit();
    tick();
    
    expect(authServiceMock.resetPassword).toHaveBeenCalled();
    expect(component.resetSuccess).toBeTrue();
  }));

  it('should handle reset password error', fakeAsync(() => {
    const errorResponse = { error: { message: 'Token expired' } };
    authServiceMock.resetPassword.and.returnValue(throwError(() => errorResponse));
    
    component.resetForm.get('password')?.setValue('newPassword123');
    component.resetForm.get('password_confirmation')?.setValue('newPassword123');
    
    component.onSubmit();
    tick();
    
    expect(authServiceMock.resetPassword).toHaveBeenCalled();
    expect(component.error).toBe('Token expired');
    expect(component.loading).toBeFalse();
  }));

  it('should navigate to login on success', () => {
    component.resetSuccess = true;
    fixture.detectChanges();
    
    const loginButton = fixture.debugElement.query(By.css('button[type="button"]'));
    loginButton.triggerEventHandler('click', null);
    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should toggle dark mode', () => {
    const darkModeButton = fixture.debugElement.query(By.css('button[class*="hover:bg-gray-100"]'));
    darkModeButton.triggerEventHandler('click', null);
    
    expect(themeServiceMock.toggleDarkMode).toHaveBeenCalled();
  });


  it('should display error messages for invalid fields', () => {
    component.submitted = true;
    component.resetForm.get('password')?.setValue('');
    component.resetForm.get('password_confirmation')?.setValue('');
    fixture.detectChanges();
    
    const passwordError = fixture.debugElement.query(By.css('#password + div p'));
    const confirmError = fixture.debugElement.query(By.css('#password_confirmation + div p'));
    
    expect(passwordError.nativeElement.textContent).toContain('La contraseña es requerida');
    expect(confirmError.nativeElement.textContent).toContain('La confirmación de contraseña es requerida');
  });
});