import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { PermissionListComponent } from './permission-list.component';
import { AdminService } from '../../../../core/services/admin.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { Permission } from '../../../../core/models/user.model';

// helper para mocks
const perm = (id: number, name: string): Permission => ({ id, name, guard_name: 'test' } as Permission);

const mockPermissions: Permission[] = [
  perm(1, 'user_create'),
  perm(2, 'user_read'),
  perm(3, 'user_update'),
  perm(4, 'user_delete'),
  perm(5, 'role_create'),
  perm(6, 'role_read'),
  perm(7, 'admin_access'),
  perm(8, 'admin_manage')
];

describe('PermissionListComponent', () => {
  let component: PermissionListComponent;
  let fixture: ComponentFixture<PermissionListComponent>;
  let adminSpy: jasmine.SpyObj<AdminService>;
  let themeSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    adminSpy = jasmine.createSpyObj('AdminService', ['getPermissions']);
    themeSpy = jasmine.createSpyObj('ThemeService', ['isDarkMode']);

    await TestBed.configureTestingModule({
      imports: [PermissionListComponent, CommonModule, FormsModule],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: ThemeService, useValue: themeSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionListComponent);
    component = fixture.componentInstance;
    adminSpy.getPermissions.and.returnValue(of(mockPermissions as any));
    themeSpy.isDarkMode.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // loadPermissions
  it('should load permissions and clear loading', () => {
    component.loading = true;
    component.loadPermissions();
    expect(adminSpy.getPermissions).toHaveBeenCalled();
    expect(component.permissions.length).toBe(8);
    expect(component.loading).toBeFalse();
  });

  it('should stop loading on error', () => {
    adminSpy.getPermissions.and.returnValue(throwError(() => new Error('fail')));
    component.loadPermissions();
    expect(component.loading).toBeFalse();
  });

  // template states
  describe('template states', () => {

    it('shows “no permissions” message when list empty', () => {
      component.permissions = [];
      component.loading = false;
      fixture.detectChanges();
      const h3 = fixture.nativeElement.querySelector('h3');
      expect(h3?.textContent?.toLowerCase()).toContain('admin');
    });

    it('renders groups when data loaded', () => {
      component.permissions = mockPermissions;
      component.loading = false;
      fixture.detectChanges();
      const groups = fixture.nativeElement.querySelectorAll('.border.border-gray-200');
      expect(groups.length).toBeGreaterThan(0);
    });
  });
});
