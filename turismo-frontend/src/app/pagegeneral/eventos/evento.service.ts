import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Emprendedor {
  id: number;
  nombre: string;
  tipo_servicio: string;
  descripcion: string;
  // ... otros campos
}

// Nuevas interfaces para sliders
export interface Slider {
  id: number;
  url: string;
  nombre: string;
  es_principal: boolean;
  tipo_entidad: string;
  entidad_id: number;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  url_completa: string;
  // Agregado:
    descripcion?: {
    id: number;
    slider_id: number;
    titulo: string;
    descripcion: string;
  };
}

export interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string; // Formato: YYYY-MM-DD
  hora?: string; // Formato: HH:mm
  ubicacion?: string;
  mapaUrl?: string;
  tipo?: string;
  tipo_evento: string;
  fecha_inicio: string;
    fecha_fin: string;
  hora_inicio: string;
    hora_fin: string;
  duracion_horas: string;
  imagen: string;
  destacado?: boolean;
  precio?: number;
  precioIncluye?: string; // Añade esta línea
  organizador?: string;
  ticketUrl?: string;
  duracion?: string;
  restricciones?: string;
  // Nuevos campos agregados:
    sliders_principales: Slider[];
  sliders: Slider[];  
  emprendedor: Emprendedor;
}



interface ApiResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Evento[];
  };
}

export interface FiltrosEventos {
  busqueda?: string;
  nombre: string;
  descripcion: string;
  tipo_evento: string;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_fin: string;
  hora_fin: string;
  emprendedor: {
    nombre: string;
  };
}

export interface SliderEmprendimiento {
  id: number;
  url: string;
  url_completa: string;
  nombre: string;
  es_principal: boolean;
  tipo_entidad: string;
  entidad_id: number;
  orden: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  obtenerEvento(id: number) {
    return this.http.get<any>(`${this.API_URL}/eventos/${id}`);
  }
  obtenerEventos() {
    return this.http.get<any>(`${this.API_URL}/eventos`);
  }


  private apiUrl = 'http://127.0.0.1:8000/api/eventos';



  getEventos(): Observable<Evento[]> {
    return new Observable<Evento[]>(observer => {
      this.http.get<ApiResponse>(this.apiUrl).subscribe({
        next: (response) => {
          if (response.success) {
            observer.next(response.data.data);
            observer.complete();
          } else {
            observer.error('Error en la respuesta de la API');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getEventoById(id: number): Observable<Evento> {
    return this.http.get<{ success: boolean; data: Evento }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getImagenUrl(imagenPath: string | undefined): string {
  if (!imagenPath) {
    return 'assets/images/eventos/default.jpg';
  }
  
  // Si ya es una URL completa
  if (imagenPath.startsWith('http')) {
    return imagenPath;
  }
  
  // Ruta local en assets
  return `assets/images/eventos/${imagenPath}`;
}
getProximosEventos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proximosEventos`);
  }

  
}