import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';
import { User, AuthResponse } from '../models/user.model';
import { ApiResponse } from '../models/api.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };

  const dummyUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '123456789'
    // Agrega otros campos obligatorios si existen
  };

  const dummyAuthResponse: AuthResponse = {
    access_token: 'fake-token',
    token_type: 'Bearer',
    expires_in: 3600,
    user: dummyUser,
    email_verified: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.match(() => true).forEach(req => req.flush({}));
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    service.login({ email: 'test@example.com', password: '123456' }).subscribe(res => {
      expect(res.user).toEqual(dummyUser);
    });

    const loginReq = httpMock.expectOne(`${environment.apiUrl}/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ success: true, data: dummyAuthResponse } as ApiResponse<AuthResponse>);

    const profileReq = httpMock.expectOne(`${environment.apiUrl}/profile`);
    profileReq.flush({ success: true, data: { user: dummyUser, email_verified: true } });
  });

  it('should store token on login', () => {
    service.login({ email: 'test@example.com', password: '123456' }).subscribe();
    const loginReq = httpMock.expectOne(`${environment.apiUrl}/login`);
    loginReq.flush({ success: true, data: dummyAuthResponse });

    const profileReq = httpMock.expectOne(`${environment.apiUrl}/profile`);
    profileReq.flush({ success: true, data: { user: dummyUser, email_verified: true } });

    expect(localStorage.getItem('auth_token')).toBe('fake-token');
  });

  it('should call logout and clear localStorage', () => {
    localStorage.setItem('auth_token', 'fake-token');
    service.logout().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should verify email', () => {
    service.verifyEmail(1, 'hash').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/email/verify/1/hash`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });

  it('should resend verification email', () => {
    service.resendVerificationEmail().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/email/verification-notification`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
