import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoogleAuthService } from './google-auth.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GoogleAuthService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(GoogleAuthService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('verifyGoogleToken', () => {
    it('should verify token and store access_token', () => {
      const mockToken = 'abc123';
      const mockResponse = {
        success: true,
        data: { access_token: 'token123' }
      };

      spyOn(localStorage, 'setItem');

      service.verifyGoogleToken(mockToken).subscribe(data => {
        expect(data.access_token).toBe('token123');
        expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'token123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google/verify-token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: mockToken });

      req.flush(mockResponse);
    });

    it('should throw error if response is invalid', () => {
      const mockToken = 'invalid-token';
      const mockResponse = { success: false };

      service.verifyGoogleToken(mockToken).subscribe({
        next: () => fail('should have failed'),
        error: (err) => expect(err).toBeTruthy()
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google/verify-token`);
      req.flush(mockResponse);
    });

    it('should catch HTTP error', () => {
      const mockToken = 'abc';
      const errorMsg = 'Internal Server Error';

      service.verifyGoogleToken(mockToken).subscribe({
        next: () => fail('should have thrown'),
        error: (error) => expect(error).toBeTruthy()
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google/verify-token`);
      req.flush({ message: errorMsg }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('signOutFromGoogle', () => {
    it('should call authService.logout', () => {
      service.signOutFromGoogle();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });
  });

  describe('initGoogleOneTap', () => {
    beforeEach(() => {
      // Simular el objeto window.google
      (window as any).google = {
        accounts: {
          id: {
            initialize: jasmine.createSpy('initialize'),
            disableAutoSelect: jasmine.createSpy('disableAutoSelect'),
            prompt: jasmine.createSpy('prompt'),
            renderButton: jasmine.createSpy('renderButton')
          }
        }
      };
    });

    it('should initialize Google One Tap without autoPrompt', () => {
      service.initGoogleOneTap();
      expect(window.google.accounts.id.initialize).toHaveBeenCalled();
      expect(window.google.accounts.id.disableAutoSelect).toHaveBeenCalled();
    });

    it('should initialize Google One Tap with autoPrompt', () => {
      service.initGoogleOneTap(true);
      expect(window.google.accounts.id.initialize).toHaveBeenCalled();
      expect(window.google.accounts.id.disableAutoSelect).not.toHaveBeenCalled();
    });
  });

  describe('renderGoogleButton', () => {
    beforeEach(() => {
      (window as any).google = {
        accounts: {
          id: {
            renderButton: jasmine.createSpy('renderButton')
          }
        }
      };
    });

    it('should render the Google Sign-In button if element exists', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'google-btn';
      document.body.appendChild(mockElement);

      service.renderGoogleButton('google-btn');
      expect(window.google.accounts.id.renderButton).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });

    it('should log error if element is missing', () => {
      spyOn(console, 'error');
      service.renderGoogleButton('missing-btn');
      expect(console.error).toHaveBeenCalledWith('Button element with id "missing-btn" not found');
    });
  });

  describe('promptGoogleOneTap', () => {
    it('should call prompt and handle skipped moments', () => {
      const mockNotification = {
        isNotDisplayed: () => true,
        isSkippedMoment: () => false,
        getNotDisplayedReason: () => 'user_declined'
      };

      (window as any).google = {
        accounts: {
          id: {
            prompt: (callback: any) => callback(mockNotification)
          }
        }
      };

      spyOn(console, 'log');
      service.promptGoogleOneTap();
      expect(console.log).toHaveBeenCalledWith('One Tap not displayed:', 'user_declined');
    });
  });
});
