import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmprendimientoDashboardComponent } from './emprendimiento-dashboard.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { DashboardEmprendimiento } from '../../../core/models/emprendimiento-admin.model';

describe('EmprendimientoDashboardComponent', () => {
  let component: EmprendimientoDashboardComponent;
  let fixture: ComponentFixture<EmprendimientoDashboardComponent>;
  let mockService: jasmine.SpyObj<EmprendimientoAdminService>;

  const fakeDashboard: DashboardEmprendimiento = {


  reservas_hoy: 3,
  reservas_pendientes: 5,
  ingresos_mes: 450.00,
  servicios_populares: [],
  reservas_proximas: [],
  servicios_activos: 4,
  total_reservas_confirmadas: 10 // si está en tu modelo
};


  beforeEach(async () => {
    mockService = jasmine.createSpyObj('EmprendimientoAdminService', ['getDashboard', 'getEmprendimiento']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: EmprendimientoAdminService, useValue: mockService },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              paramMap: of(new Map([['id', '1']]))
            }
          }
        }
      ],
      imports: [EmprendimientoDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmprendimientoDashboardComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar el dashboard al inicializar', () => {
    mockService.getDashboard.and.returnValue(of(fakeDashboard));

    component.ngOnInit();

    expect(component.emprendimientoId).toBe(1);
    expect(mockService.getDashboard).toHaveBeenCalledWith(1);
  });

  it('debería manejar error al cargar dashboard', () => {
    const error = { error: { message: 'Fallo de conexión' } };
    mockService.getDashboard.and.returnValue(throwError(() => error));

    component.ngOnInit();

    expect(component.error).toBe('Fallo de conexión');
    expect(component.loading).toBeFalse();
  });

  it('refreshData debería volver a cargar el dashboard', () => {
    mockService.getDashboard.and.returnValue(of(fakeDashboard));
    component.emprendimientoId = 1;

    component.refreshData();

    expect(mockService.getDashboard).toHaveBeenCalledWith(1);
  });

  it('trackByServicioId debería retornar servicio_id', () => {
    const mockItem = { servicio_id: 123 };
    expect(component.trackByServicioId(0, mockItem)).toBe(123);
  });

  it('trackByReservaId debería retornar id', () => {
    const mockItem = { id: 456 };
    expect(component.trackByReservaId(0, mockItem)).toBe(456);
  });
});
