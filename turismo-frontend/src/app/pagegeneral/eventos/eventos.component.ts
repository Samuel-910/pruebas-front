import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarEvent, CalendarModule, CalendarUtils } from 'angular-calendar';
import { Emprendedor, Evento, EventosService } from './evento.service';
import { addMonths, subMonths } from 'date-fns';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, RouterModule],
  providers: [CalendarUtils],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  constructor(private eventosService: EventosService) { }

  eventos: Evento[] = [];
  eventoDestacado: Evento | undefined;
  eventoCercano: Evento | null = null;
  eventoMasCercano: Evento | null = null;
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  mostrarModalCalendario = false;

  // Filtros
  filtroAnio: string = 'todos';
  filtroMes: string = 'proximos';
  filtroTipo: string = 'todos';

    filtrosAplicados: boolean = false;

  // Filtros personalizados
  filtroNombre: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarEventoCercano();
    this.obtenerEventoMasProximo();
  }

  cargarEventos(): void {
    this.eventosService.getEventos().subscribe((data) => {
      this.eventos = data;

      if (this.eventos.length > 0) {
        // Evento destacado por ID fijo o el primero
        this.eventoDestacado = this.eventos.find(e => e.id === 1) || this.eventos[0];

        // Evento más cercano (basado en fecha_inicio + hora_inicio)
        const ahora = new Date();

        const eventosFuturos = this.eventos.filter(evento =>
          new Date(`${evento.fecha_inicio}T${evento.hora_inicio}`) >= ahora
        );

        const colores = ['#F97316', '#FACC15', '#34D399', '#60A5FA', '#A78BFA', '#F87171'];

        eventosFuturos.sort((a, b) =>
          new Date(`${a.fecha_inicio}T${a.hora_inicio}`).getTime() -
          new Date(`${b.fecha_inicio}T${b.hora_inicio}`).getTime()
        );

        this.eventoCercano = eventosFuturos[0] || null;

        console.log('Evento más cercano:', this.eventoCercano);
      }

      this.actualizarCalendario();
    });
  }

  generarEventosParaCalendario(eventos: Evento[]): CalendarEvent[] {
    return eventos.map(evento => ({
      start: new Date(evento.fecha_inicio),
      end: new Date(evento.fecha_fin),
      title: evento.nombre,
      allDay: false,
      color: {
        primary: '#F97316',     // Naranja vibrante
        secondary: '#FFF7ED'    // Fondo suave
      },
      meta: {
        eventoData: evento // Para acceder a más detalles si necesitas
      }
    }));
  }

  generarEventosCalendarioCompleto(): CalendarEvent[] {
    return this.eventos.map(evento => ({
      start: new Date(`${evento.fecha_inicio}T${evento.hora_inicio || '08:00'}`),
      end: new Date(`${evento.fecha_fin}T${evento.hora_fin || '18:00'}`),
      title: evento.nombre,
      allDay: false,
      color: {
        primary: '#f97316',
        secondary: '#fef3c7'
      },
      meta: {
        eventoData: evento
      }
    }));
  }

  // Métodos de filtros corregidos
  aplicarFiltros(): void {
    // Este método se ejecuta automáticamente gracias al getter eventosFiltrados
    this.actualizarCalendario();
  }

  // Verificar si hay filtros activos
  hayFiltrosActivos(): boolean {
    return !!(this.filtroNombre.trim() || 
              this.filtroFechaInicio || 
              this.filtroFechaFin || 
              (this.filtroTipo && this.filtroTipo !== 'todos'));
  }

  // Limpiar todos los filtros
  limpiarTodosFiltros(): void {
    this.filtroNombre = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroTipo = 'todos';
    this.aplicarFiltros();
  }

  // Método para actualizar la vista (si lo necesitas)
  actualizarVista(): void {
    this.actualizarCalendario();
  }

  cargarEventoCercano(): void {
    console.log('Método cargarEventoCercano llamado');
    this.eventosService.getProximosEventos().subscribe({
      next: res => {
        if (res.success && res.data.length > 0) {
          const eventosOrdenados = res.data.sort((a: any, b: any) =>
            new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
          );

          this.eventoCercano = eventosOrdenados[0];

          // 👇 AGREGAS ESTO AQUÍ PARA VERIFICAR LA IMAGEN
          console.log('Sliders:', this.eventoCercano?.sliders);
          console.log('URL completa:', this.eventoCercano?.sliders?.[0]?.url_completa);

        }
      },
      error: err => {
        console.error('Error al cargar el evento más cercano', err);
      }
    });
  }

  // Getter para eventos filtrados
  get eventosFiltrados(): Evento[] {
    return this.eventos.filter(evento => {
      const nombreCoincide = this.filtroNombre.trim() === '' ||
        evento.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const fechaInicio = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
      const fechaFin = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;
      const fechaEvento = new Date(`${evento.fecha_inicio}T${evento.hora_inicio || '00:00'}`);

      const dentroDelRango =
        (!fechaInicio || fechaEvento >= fechaInicio) &&
        (!fechaFin || fechaEvento <= fechaFin);

      const tipoCoincide =
        !this.filtroTipo || 
        this.filtroTipo === 'todos' || 
        evento.tipo_evento?.toLowerCase() === this.filtroTipo.toLowerCase();

      return nombreCoincide && dentroDelRango && tipoCoincide;
    });
  }

  resetearFiltros() {
    this.filtroNombre = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroTipo = 'todos';
    this.aplicarFiltros();
  }

  get tiposEventosUnicos(): string[] {
    const tipos = this.eventos
      .map(e => e.tipo_evento?.trim())
      .filter((tipo): tipo is string => typeof tipo === 'string' && tipo.length > 0);

    return Array.from(new Set(tipos));
  }

  actualizarCalendario(): void {
    this.calendarEvents = this.eventosFiltrados.map(evento => ({
      start: new Date(`${evento.fecha_inicio}T${evento.hora_inicio || '08:00'}`),
      end: new Date(`${evento.fecha_fin}T${evento.hora_fin || '18:00'}`),
      title: evento.nombre,
      allDay: false
    }));
  }

  openCalendar() {
    this.mostrarModalCalendario = !this.mostrarModalCalendario;
    this.calendarEvents = this.generarEventosCalendarioCompleto();
  }

  siguienteMes() {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  anteriorMes() {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  getSliderImage(evento: Evento | null): string {
    return evento?.sliders?.[0]?.url_completa || 'assets/default-image.jpg';
  }

  getImagenEventoDestacado(): string {
    return this.eventoDestacado?.sliders_principales?.[0]?.url_completa ?? 'assets/images/eventos/default.jpg';
  }

  getImagenesEvent(): any[] {
    return this.eventoDestacado?.sliders_principales || [];
  }

  obtenerEventoMasProximo(): void {
    const eventosValidos = this.eventos.filter(evento => evento.fecha_inicio);

    const eventosOrdenados = eventosValidos.sort((a, b) => {
      return new Date(a.fecha_inicio + ' ' + a.hora_inicio).getTime() -
        new Date(b.fecha_inicio + ' ' + b.hora_inicio).getTime();
    });

    this.eventoMasCercano = eventosOrdenados[0] || null;
  }

  encontrarEventoMasCercano(): void {
    const hoyStr = new Date().toISOString().split('T')[0];

    const eventosFuturos = this.eventos.filter(evento => {
      const fechaEventoStr = new Date(evento.fecha_inicio).toISOString().split('T')[0];
      return fechaEventoStr >= hoyStr;
    });

    eventosFuturos.sort((a, b) =>
      new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
    );

    this.eventoMasCercano = eventosFuturos[0] || null;
  }
}

export class CalendarioComponent {
  mostrarModalCalendario = false;

  viewDate: Date = new Date();

  calendarEvents: CalendarEvent[] = [
    {
      start: new Date(),
      title: 'Evento hoy',
      color: { primary: '#ed8936', secondary: '#f6ad55' }
    },
    {
      start: new Date(new Date().setDate(new Date().getDate() + 5)),
      title: 'Evento futuro',
      color: { primary: '#ed8936', secondary: '#f6ad55' }
    }
  ];

  anteriorMes() {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
  }

  siguienteMes() {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
  }
}