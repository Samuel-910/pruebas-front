import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradoresListComponent } from './administradores-list.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento } from '../../../core/models/emprendimiento.model';
import { User } from '../../../core/models/user.model';

describe('AdministradoresListComponent', () => {
  let component: AdministradoresListComponent;
  let fixture: ComponentFixture<AdministradoresListComponent>;
  let mockService: jasmine.SpyObj<EmprendimientoAdminService>;

  const fakeEmprendimiento: Emprendimiento = {
    id: 1,
    nombre: 'Demo',
    descripcion: 'Demo',
    ubicacion: 'Demo',
    telefono: 'Demo',
    tipo_servicio: 'Demo',
    email: 'Demo',
    categoria: 'Demo',
    administradores: [] as User[],

  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('EmprendimientoAdminService', [
      'getEmprendimiento',
      'addAdministrador',
      'removeAdministrador'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AdministradoresListComponent,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              // aquí el truco: un ParamMap real
              paramMap: of(convertToParamMap({ id: '1' }))
            }
          }
        },
        { provide: EmprendimientoAdminService, useValue: mockService }
      ]
    }).compileComponents();

    // Preparo el spy ANTES de que ngOnInit lo llame
    mockService.getEmprendimiento.and.returnValue(of(fakeEmprendimiento));

    fixture = TestBed.createComponent(AdministradoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit()
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario', () => {
    expect(component.adminForm).toBeDefined();
    expect(component.adminForm.controls['email']).toBeTruthy();
  });

  it('debería cargar el emprendimiento al iniciar', () => {
    // ngOnInit ya fue llamado en detectChanges, así que getEmprendimiento debió haberse invocado:
    expect(mockService.getEmprendimiento).toHaveBeenCalledWith(1);
    expect(component.emprendimiento).toEqual(fakeEmprendimiento);
  });

  it('should return initials from name', () => {
    const initials = component.getInitials('Juan Pérez');
    expect(initials).toBe('JP');
  });

  it('should return true if admin can be removed', () => {
    const admin: User = { id: 5, name: 'Carlos', pivot: { es_principal: false } } as User;
    component.adminStates[5] = { removing: false };
    expect(component.canRemoveAdmin(admin)).toBeTrue();
  });

  it('should return role display name', () => {
    expect(component.getRolDisplayName('moderador')).toBe('Moderador');
    expect(component.getRolDisplayName('desconocido')).toBe('desconocido');
  });

  it('should return role color', () => {
    expect(component.getRolColor('colaborador')).toBe('text-green-300');
    expect(component.getRolColor('otro')).toBe('text-gray-300');
  });

  // … más tests de add/remove si quieres …
});
