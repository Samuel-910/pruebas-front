import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservasComponent } from './reservas.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

describe('ReservasComponent', () => {
  let component: ReservasComponent;
  let fixture: ComponentFixture<ReservasComponent>;
  let paramsSubject: Subject<any>;

  beforeEach(() => {
    paramsSubject = new Subject();
    TestBed.configureTestingModule({
      imports: [ReservasComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramsSubject } }
      ]
    });
    fixture = TestBed.createComponent(ReservasComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe asignar el id de familia desde los parámetros de la ruta', () => {
    component.ngOnInit();
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    expect(component.familiaId).toBe('123');
  });

  it('debe actualizar el id de familia si el parámetro cambia', () => {
    component.ngOnInit();
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    expect(component.familiaId).toBe('123');
    paramsSubject.next({ id: '456' });
    fixture.detectChanges();
    expect(component.familiaId).toBe('456');
  });
}); 