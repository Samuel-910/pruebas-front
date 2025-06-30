import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { runInInjectionContext } from '@angular/core';

import { carritoGuard } from './carrito.guard';
import { AuthService } from '../services/auth.service';

describe('carritoGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let injector: Injector;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    });
    router = TestBed.inject(Router);
    injector = TestBed.inject(Injector);
    spyOn(router, 'navigate');
  });

  it('should allow access when user is logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    const result = runInInjectionContext(injector, () => carritoGuard());
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const result = runInInjectionContext(injector, () => carritoGuard());
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { redirect: '/carrito' } });
  });
});