import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError, isObservable } from 'rxjs';
import { runInInjectionContext } from '@angular/core';

import { authGuard, nonAuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn', 'currentUser', 'getToken', 'loadUserProfile'
    ]);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    });
    router = TestBed.inject(Router);
    route = new ActivatedRouteSnapshot();
    state = { url: '/some', root: route } as any;
  });

  it('should allow if already logged in and user present', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.currentUser.and.returnValue({ id: 1 } as any);

    const result = runInInjectionContext(TestBed as unknown as Injector, () => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('should redirect to login if no token', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getToken.and.returnValue(null);

    const result = runInInjectionContext(TestBed as unknown as Injector, () => authGuard(route, state)) as UrlTree;
    expect(result.toString()).toBe(router.createUrlTree(['/login']).toString());
  });

  it('should allow after loading profile when token and user loads', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getToken.and.returnValue('token');
    authServiceSpy.loadUserProfile.and.returnValue(of({ id: 1 } as any));

    const guardResult = runInInjectionContext(TestBed as unknown as Injector, () => authGuard(route, state));
    expect(isObservable(guardResult)).toBeTrue();
    const result$ = guardResult as Observable<boolean | UrlTree>;
    let resolved!: boolean | UrlTree;
    result$.subscribe((res: boolean | UrlTree) => resolved = res);
    tick();
    expect(resolved).toBe(true);
  }));

  it('should redirect to login on load profile returning null', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getToken.and.returnValue('token');
    authServiceSpy.loadUserProfile.and.returnValue(of(null));

    const guardResult = runInInjectionContext(TestBed as unknown as Injector, () => authGuard(route, state));
    expect(isObservable(guardResult)).toBeTrue();
    const result$ = guardResult as Observable<boolean | UrlTree>;
    let resolved!: boolean | UrlTree;
    result$.subscribe((res: boolean | UrlTree) => resolved = res);
    tick();
    expect((resolved as UrlTree).toString()).toBe(router.createUrlTree(['/login']).toString());
  }));

  it('should redirect to login on load profile error', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getToken.and.returnValue('token');
    authServiceSpy.loadUserProfile.and.returnValue(throwError(() => new Error('fail')));

    const guardResult = runInInjectionContext(TestBed as unknown as Injector, () => authGuard(route, state));
    expect(isObservable(guardResult)).toBeTrue();
    const result$ = guardResult as Observable<boolean | UrlTree>;
    let resolved!: boolean | UrlTree;
    result$.subscribe((res: boolean | UrlTree) => resolved = res);
    tick();
    expect((resolved as UrlTree).toString()).toBe(router.createUrlTree(['/login']).toString());
  }));
});

describe('nonAuthGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn', 'administraEmprendimientos', 'loadUserProfile'
    ]);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    });
    router = TestBed.inject(Router);
    route = new ActivatedRouteSnapshot();
    state = { url: '/login', root: route } as any;
  });

  it('should allow when not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const result = runInInjectionContext(TestBed as unknown as Injector, () => nonAuthGuard(route, state));
    expect(result).toBe(true);
  });

  it('should redirect to seleccion-panel if logged in and administers', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.administraEmprendimientos.and.returnValue(true);

    const result = runInInjectionContext(TestBed as unknown as Injector, () => nonAuthGuard(route, state)) as UrlTree;
    expect(result.toString()).toBe(router.createUrlTree(['/seleccion-panel']).toString());
  });

  it('should redirect to dashboard after loading profile when not administers', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.administraEmprendimientos.and.returnValue(false);
    authServiceSpy.loadUserProfile.and.returnValue(of({ id: 1 } as any));

    const guardResult = runInInjectionContext(TestBed as unknown as Injector, () => nonAuthGuard(route, state));
    expect(isObservable(guardResult)).toBeTrue();
    const result$ = guardResult as Observable<UrlTree>;
    let resolved!: UrlTree;
    result$.subscribe((res: UrlTree) => resolved = res);
    tick();
    expect(resolved.toString()).toBe(router.createUrlTree(['/dashboard']).toString());
  }));

  it('should redirect to dashboard on load profile error', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.administraEmprendimientos.and.returnValue(false);
    authServiceSpy.loadUserProfile.and.returnValue(throwError(() => new Error('fail')));

    const guardResult = runInInjectionContext(TestBed as unknown as Injector, () => nonAuthGuard(route, state));
    expect(isObservable(guardResult)).toBeTrue();
    const result$ = guardResult as Observable<UrlTree>;
    let resolved!: UrlTree;
    result$.subscribe((res: UrlTree) => resolved = res);
    tick();
    expect(resolved.toString()).toBe(router.createUrlTree(['/dashboard']).toString());
  }));
});
