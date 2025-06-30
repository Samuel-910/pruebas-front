// admin-header.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminHeaderComponent } from './admin-header.component';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

// Stub de ThemeService
class ThemeServiceStub {
  private dark = false;
  isDarkMode(): boolean {
    return this.dark;
  }
  toggleDarkMode(): void {
    this.dark = !this.dark;
  }
}

describe('AdminHeaderComponent', () => {
  let component: AdminHeaderComponent;
  let fixture: ComponentFixture<AdminHeaderComponent>;
  let themeService: ThemeServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Para componentes standalone, usar imports en lugar de declarations
      imports: [CommonModule, AdminHeaderComponent],
      providers: [
        { provide: ThemeService, useClass: ThemeServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminHeaderComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService) as any;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar título y subtítulo por defecto', () => {
    fixture.detectChanges();
    const h1: HTMLElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    const p: HTMLElement  = fixture.debugElement.query(By.css('p')).nativeElement;

    expect(h1.textContent).toContain('Panel de Administración');
    expect(p.textContent).toContain('Gestiona los recursos del sistema');
  });

  it('debería renderizar inputs personalizados', () => {
    component.title = 'Mi Título';
    component.subtitle = 'Mi Subtítulo';
    fixture.detectChanges();

    const h1: HTMLElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    const p: HTMLElement  = fixture.debugElement.query(By.css('p')).nativeElement;

    expect(h1.textContent).toContain('Mi Título');
    expect(p.textContent).toContain('Mi Subtítulo');
  });

  it('debería llamar a toggleDarkMode al hacer click en el botón', () => {
    fixture.detectChanges();
    const btnDe: DebugElement = fixture.debugElement.query(By.css('button[aria-label=\"Cambiar tema\"]'));
    expect(btnDe).toBeTruthy();

    expect(themeService.isDarkMode()).toBeFalse();
    btnDe.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(themeService.isDarkMode()).toBeTrue();
  });

  it('debería mostrar el ícono correcto según el modo', () => {
    // Modo claro → mostrar ícono de luna para cambiar a modo oscuro
    (themeService as any)['dark'] = false;
    fixture.detectChanges();
    const moonPath = fixture.debugElement.query(By.css('path[d*="M20.354"]'));
    expect(moonPath).toBeTruthy();

    // Modo oscuro → mostrar ícono de sol para cambiar a modo claro
    (themeService as any)['dark'] = true;
    fixture.detectChanges();
    const sunPath = fixture.debugElement.query(By.css('path[d*="M12 3v1"]'));
    expect(sunPath).toBeTruthy();
  });

  it('no debería renderizar el botón si showThemeToggle es false', () => {
    component.showThemeToggle = false;
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button[aria-label=\"Cambiar tema\"]'));
    expect(btn).toBeNull();
  });
});
