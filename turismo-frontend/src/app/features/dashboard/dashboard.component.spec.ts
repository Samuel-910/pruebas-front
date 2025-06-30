import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AdminService } from '../../core/services/admin.service';
import { of, throwError } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing'; // Nuevo import moderno

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  const mockSummary = {
    total_users: 10,
    active_users: 8,
    inactive_users: 2,
    total_roles: 3,
    total_permissions: 5,
    users_by_role: [
      { role: 'Admin', count: 5 },
      { role: 'User', count: 5 }
    ],
    recent_users: [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '987654321',
        created_at: '2024-06-30',
        roles: [{ id: 1, name: 'Admin' }]
      }
    ]
  };

  beforeEach(waitForAsync(() => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['getDashboardSummary']);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['getDarkMode']);

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClientTesting() // ✅ Nueva forma de mockear HttpClient
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe llamar loadDashboardData en ngOnInit', () => {
    mockAdminService.getDashboardSummary.and.returnValue(of(mockSummary));
    spyOn(component, 'loadDashboardData').and.callThrough();
    component.ngOnInit();
    expect(component.loadDashboardData).toHaveBeenCalled();
  });

  it('debe cargar datos correctamente desde AdminService', () => {
    mockAdminService.getDashboardSummary.and.returnValue(of(mockSummary));
    component.loadDashboardData();
    expect(component.loading).toBeFalse();
    expect(component.summary).toEqual(mockSummary);
  });

  it('debe manejar errores al cargar datos', () => {
    mockAdminService.getDashboardSummary.and.returnValue(throwError(() => new Error('Error de red')));
    spyOn(console, 'error');
    component.loadDashboardData();
    expect(component.loading).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Error al cargar datos del dashboard:', jasmine.any(Error));
  });

  it('debe retornar las iniciales del usuario correctamente', () => {
    const user = { name: 'María López' };
    expect(component.getUserInitials(user)).toBe('ML');
  });

  it('debe retornar fecha formateada correctamente', () => {
    const date = '2024-06-30T00:00:00Z';
    expect(component.formatDate(date)).toContain(''); // Asegúrate que coincida con el día correct
  });
});
