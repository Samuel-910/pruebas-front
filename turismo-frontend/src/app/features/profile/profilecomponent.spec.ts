import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ActivatedRoute } from '@angular/router';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const mockUser = {
    name: 'Ana Torres',
    email: 'ana@example.com',
    phone: '987654321',
    country: 'Perú',
    birth_date: '2000-01-01',
    address: 'Jr. Lima',
    gender: 'female',
    preferred_language: 'es',
    roles: [
      {
        id: 1,
        name: 'Admin',
        permissions: []
      }
    ]
  };

  const authServiceMock = jasmine.createSpyObj('AuthService', ['getProfile', 'updateProfile']);
  const themeServiceMock = jasmine.createSpyObj('ThemeService', ['isDarkMode', 'toggleDarkMode']);

  beforeEach(waitForAsync(() => {
    authServiceMock.getProfile.and.returnValue(of(mockUser));
    authServiceMock.updateProfile.and.returnValue(of(mockUser));

    TestBed.configureTestingModule({
      imports: [
        ProfileComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        provideHttpClientTesting(),
        // Añadimos un stub para ActivatedRoute
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (_: string) => null } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar datos del usuario en el formulario', () => {
    expect(component.profileForm.value.name).toBe(mockUser.name);
    expect(component.profileForm.value.email).toBe(mockUser.email);
  });

  it('debería obtener las iniciales correctamente', () => {
    component.user = mockUser;
    const initials = component.getUserInitials();
    expect(initials).toBe('AT');
  });

  it('debería retornar true si el usuario tiene roles', () => {
    component.user = mockUser;
    expect(component.hasRoles()).toBeTrue();
  });

  it('debería retornar longitud de roles', () => {
    component.user = mockUser;
    expect(component.getRolesLength()).toBe(1);
  });
});
