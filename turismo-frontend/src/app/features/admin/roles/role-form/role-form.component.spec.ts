import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RoleFormComponent } from './role-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { Permission } from '../../../../core/models/user.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RoleFormComponent (unit)', () => {
  let component: RoleFormComponent;
  let fixture: ComponentFixture<RoleFormComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let router: Router;


  const mockPermissions: Permission[] = [
    { id: 1, name: 'user_create' } as unknown as Permission,
    { id: 2, name: 'user_edit' } as unknown as Permission,
    { id: 3, name: 'post_view' } as unknown as Permission,
  ];

  const mockRole = {
    id: 1,
    name: 'Editor',
    permissions: mockPermissions.slice(0, 2),
  };

  // ────────────────────────────────────────────────────────────
  //  Helper: bootstraps TestBed
  // ────────────────────────────────────────────────────────────
  function configureTestingModule(routeId: string | null) {
    /**
     * Creamos el spy sin el parámetro genérico y luego casteamos para que TS
     * no se queje, manteniendo el autocompletado en los tests.
     */
    adminServiceSpy = jasmine.createSpyObj(
      'AdminService',
      ['getPermissions', 'getRole', 'updateRole', 'createRole'],
    ) as jasmine.SpyObj<AdminService>;

    // Valores de retorno simulados
    (adminServiceSpy.getPermissions as jasmine.Spy).and.returnValue(of(mockPermissions));
    (adminServiceSpy.getRole as jasmine.Spy).and.returnValue(of(mockRole));
    (adminServiceSpy.updateRole as jasmine.Spy).and.returnValue(of(void 0));
    (adminServiceSpy.createRole as jasmine.Spy).and.returnValue(of(void 0));

    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: (_: string) => routeId,
        },
      },
    } as unknown as ActivatedRoute;

    TestBed.configureTestingModule({
      imports: [
        RoleFormComponent, // componente standalone
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ThemeService, useValue: { isDarkMode: () => false } },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(window, 'alert'); // evita pop‑ups durante los tests

    fixture.detectChanges(); // lanza ngOnInit
  }

  // ────────────────────────────────────────────────────────────
  //  Creation mode (no id)
  // ────────────────────────────────────────────────────────────
  describe('creation mode', () => {
    beforeEach(() => configureTestingModule(null));

    it('debería crearse el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería cargar permisos y empezar con valores de formulario vacíos', () => {
      expect(component.availablePermissions.length).toBe(mockPermissions.length);
      expect(component.isEditMode).toBeFalse();
      expect(component.roleForm.value).toEqual({ name: '', permissions: [] });
    });

    it('togglePermission agrega y luego quita el permiso indicado', () => {
      const permName = mockPermissions[0].name;
      component.togglePermission(permName);
      expect(component.roleForm.get('permissions')?.value).toContain(permName);

      component.togglePermission(permName);
      expect(component.roleForm.get('permissions')?.value).not.toContain(permName);
    });

    it('selectAllPermissions debe seleccionar todos', () => {
      component.selectAllPermissions();
      expect(component.roleForm.get('permissions')?.value.length).toBe(mockPermissions.length);
    });

    it('clearAllPermissions debe vaciar el arreglo', () => {
      component.selectAllPermissions();
      component.clearAllPermissions();
      expect(component.roleForm.get('permissions')?.value.length).toBe(0);
    });

    it('onSubmit NO llama a createRole si el formulario es inválido', () => {
      component.onSubmit();
      expect(adminServiceSpy.createRole).not.toHaveBeenCalled();
    });

    it('onSubmit llama a createRole y navega cuando el formulario es válido', () => {
      component.roleForm.patchValue({
        name: 'New role',
        permissions: [mockPermissions[0].name],
      });

      component.onSubmit();

      expect(adminServiceSpy.createRole).toHaveBeenCalledWith(component.roleForm.value);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/roles']);
    });
  });

  // ────────────────────────────────────────────────────────────
  //  Edit mode (id presente)
  // ────────────────────────────────────────────────────────────
  describe('edit mode', () => {
    beforeEach(() => configureTestingModule('1'));

    it('debería cargar datos del rol y estar en modo edición', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.roleForm.value.name).toBe(mockRole.name);
      expect(component.roleForm.get('permissions')?.value.length).toBe(
        mockRole.permissions.length,
      );
    });

    it('getPermissionGroups agrupa por prefijo', () => {
      const groups = component.getPermissionGroups();
      expect(groups.some(g => g.groupName === 'User')).toBeTrue();
      expect(groups.some(g => g.groupName === 'Post')).toBeTrue();
    });

    it('filterPermissions respeta el término de búsqueda', () => {
      component.searchTerm = 'edit';
      const filtered = component.filterPermissions(mockPermissions);
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('user_edit');
    });

    it('onSubmit llama a updateRole y navega cuando el formulario es válido', () => {
      component.roleForm.patchValue({ name: 'Editor actualizado' });

      component.onSubmit();

      expect(adminServiceSpy.updateRole).toHaveBeenCalledWith(1, component.roleForm.value);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/roles']);
    });
  });
});
