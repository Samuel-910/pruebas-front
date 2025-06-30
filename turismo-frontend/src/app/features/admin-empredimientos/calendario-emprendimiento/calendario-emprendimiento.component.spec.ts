import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarioEmprendimientoComponent } from './calendario-emprendimiento.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { CalendarioEmprendimiento } from '../../../core/models/emprendimiento.model';

describe('CalendarioEmprendimientoComponent', () => {
  let component: CalendarioEmprendimientoComponent;
  let fixture: ComponentFixture<CalendarioEmprendimientoComponent>;
  let mockService: jasmine.SpyObj<EmprendimientoAdminService>;

  beforeEach(async () => {
    const mockRoute = {
      parent: {
        paramMap: of({
          get: () => '123' // simula emprendimientoId = 123
        })
      }
    };

    mockService = jasmine.createSpyObj('EmprendimientoAdminService', ['getCalendario']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: EmprendimientoAdminService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioEmprendimientoComponent);
    component = fixture.componentInstance;
  });

    it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

    it('debería cargar el calendario correctamente', () => {
    const mockCalendario: CalendarioEmprendimiento = {
  fecha_inicio: '2025-06-01',
  fecha_fin: '2025-06-30',
  total_reservas: 1,
  ingresos_periodo: 150.00,
  eventos_por_dia: {
    '2025-06-01': [
      {
        id: 1,
        titulo: 'Tour Lago',
        hora_inicio: '09:00',
        hora_fin: '12:00',
        estado: 'confirmado',
         cliente: 'Juan Pérez', 
        precio: '150.00', // tipo string
        email_cliente: 'juan@correo.com',
        telefono_cliente: '123456789',
        duracion_minutos: 180
      }
    ]
  }
};


    mockService.getCalendario.and.returnValue(of(mockCalendario));

    fixture.detectChanges();

    expect(component.emprendimientoId).toBe(123);
    expect(component.calendarioData).toEqual(mockCalendario);
    expect(component.calendarDays.length).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
  });

    it('debería construir el calendario con días del mes actual', () => {
    component.calendarioData = {
      fecha_inicio: '2025-06-01',
      fecha_fin: '2025-06-30',
      total_reservas: 0,
      ingresos_periodo: 0,
      eventos_por_dia: {}
    };
    (component as any).buildCalendar();

    const currentMonth = new Date().getMonth();
    expect(component.calendarDays.some(d => d.isCurrentMonth)).toBeTrue();
  });

    it('debería retornar clase CSS correcta para estado "confirmado"', () => {
    const clase = component.getEventoEstadoBadge('confirmado');
    expect(clase).toContain('green');
  });

    it('debería seleccionar un día y deseleccionar los demás', () => {
    component.calendarDays = [
      { date: new Date(), isCurrentMonth: true, isToday: false, isSelected: false, eventos: [], totalEventos: 0, ingresosDia: 0 },
      { date: new Date(), isCurrentMonth: true, isToday: false, isSelected: false, eventos: [], totalEventos: 0, ingresosDia: 0 }
    ];

    const dayToSelect = component.calendarDays[1];
    component.selectDay(dayToSelect);

    expect(component.selectedDay).toBe(dayToSelect);
    expect(dayToSelect.isSelected).toBeTrue();
    expect(component.calendarDays[0].isSelected).toBeFalse();
  });

    it('debería formatear correctamente la fecha seleccionada', () => {
    const testDate = new Date(2025, 5, 10); // 10 de junio 2025
    component.selectedDay = {
      date: testDate,
      isCurrentMonth: true,
      isToday: false,
      isSelected: true,
      eventos: [],
      totalEventos: 0,
      ingresosDia: 0
    };

    expect(component.formatSelectedDayDate()).toBe('10 de Junio de 2025');
  });

});