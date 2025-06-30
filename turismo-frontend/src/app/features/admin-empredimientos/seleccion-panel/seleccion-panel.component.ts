import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seleccion-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <!-- Fondo hero con imagen y overlay -->
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center">
        <!-- Overlay dinámico según tema -->
        <div class="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-amber-900/70 to-yellow-800/80 dark:from-blue-900/80 dark:via-indigo-900/70 dark:to-blue-800/80 backdrop-blur-md transition-all duration-500"></div>
        
        <!-- Efectos de luz -->
        <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-amber-400/10 dark:from-blue-400/30 dark:to-indigo-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 transition-all duration-500"></div>
        <div class="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-amber-400/20 to-orange-400/10 dark:from-indigo-400/20 dark:to-blue-400/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 transition-all duration-500"></div>
      </div>

      <!-- Tarjeta central -->
      <div class="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-orange-400/40 dark:border-blue-400/40 bg-white/15 dark:bg-gray-900/30 backdrop-blur-2xl animate-fade-in transition-all duration-500">
        <div class="p-4 sm:p-6 lg:p-8">
          <!-- Header -->
          <div class="text-center mb-6 sm:mb-8">
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-400 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-lg animate-slide-in transition-all duration-500">
              Bienvenido, {{ userName }}
            </h2>
            <p class="text-base sm:text-lg text-gray-700 dark:text-gray-200 mt-2 animate-fade-in transition-colors duration-500">
              Selecciona dónde quieres ir
            </p>
          </div>

          <!-- Grid de opciones -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <!-- Panel de Administración -->
            <div 
              class="group bg-white/20 dark:bg-gray-800/30 border border-orange-400/40 dark:border-blue-400/40 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer flex flex-col items-center animate-fade-in"
              (click)="navigateTo('/dashboard')">
              
              <div class="flex justify-center mb-4">
                <div class="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-200/70 to-amber-200/70 dark:from-blue-500/70 dark:to-cyan-500/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-orange-600 dark:text-blue-100 animate-bounce transition-colors duration-500" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              
              <h3 class="text-lg sm:text-xl font-bold text-orange-600 dark:text-blue-300 text-center mb-2 transition-all duration-500">
                Panel de Administración
              </h3>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white text-center mb-3 sm:mb-4 transition-colors duration-500">
                Accede a las funciones completas de administración con todas las herramientas del sistema.
              </p>
              
              <button class="mt-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-blue-600 dark:to-cyan-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-amber-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 transition-all duration-500 active:scale-95 transform hover:scale-105 text-sm sm:text-base">
                Ir al Panel
              </button>
            </div>

            <!-- Gestión de Emprendimientos -->
            <div 
              class="group bg-white/20 dark:bg-gray-800/30 border border-amber-400/40 dark:border-cyan-400/40 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer flex flex-col items-center animate-fade-in"
              (click)="navigateTo('/mis-emprendimientos')">
              
              <div class="flex justify-center mb-4">
                <div class="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-200/70 to-orange-200/70 dark:from-cyan-500/70 dark:to-blue-500/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-amber-600 dark:text-cyan-100 animate-bounce transition-colors duration-500" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              
              <h3 class="text-lg sm:text-xl font-bold text-amber-600 dark:text-cyan-300 text-center mb-2 transition-all duration-500">
                Gestión de Emprendimientos
              </h3>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white text-center mb-3 sm:mb-4 transition-colors duration-500">
                Administra tus emprendimientos, servicios y reservas de forma fácil y eficiente.
              </p>
              
              <button class="mt-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 dark:from-cyan-600 dark:to-blue-600 text-white font-bold shadow-lg hover:from-amber-600 hover:to-orange-600 dark:hover:from-cyan-700 dark:hover:to-blue-700 transition-all duration-500 active:scale-95 transform hover:scale-105 text-sm sm:text-base">
                Ir a Emprendimientos
              </button>
            </div>
          </div>

          <!-- Botón para regresar al Home -->
          <div class="mt-6 sm:mt-8 text-center animate-fade-in">
            <button 
              (click)="navigateToHome()"
              class="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-blue-600 dark:to-cyan-600 text-white font-bold shadow-xl hover:from-orange-600 hover:to-amber-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 transition-all duration-500 transform hover:scale-105 active:scale-95 group">
              
              <svg xmlns="http://www.w3.org/2000/svg" 
                   class="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:-translate-x-1 transition-transform duration-300" 
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              
              <span class="text-base sm:text-lg">Regresar al Home</span>
              
              <svg xmlns="http://www.w3.org/2000/svg" 
                   class="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300" 
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            
            <p class="text-xs sm:text-sm text-gray-900 dark:text-white mt-3 sm:mt-4 transition-colors duration-500 font-medium">
              Puedes cambiar entre paneles en cualquier momento desde el menú lateral
            </p>
          </div>
        </div>
      </div>

      <!-- Botón Día/Noche mejorado -->
      <button
        (click)="toggleDarkMode()"
        class="fixed top-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 dark:from-blue-500 dark:to-cyan-500 shadow-xl text-white hover:scale-110 transition-all duration-500 transform hover:rotate-12 active:scale-95"
        [attr.aria-label]="isDarkMode ? 'Modo Día' : 'Modo Noche'">
        
        <div class="relative">
          <ng-container *ngIf="isDarkMode; else sunIcon">
            <svg class="h-7 w-7 transition-all duration-500 animate-pulse text-blue-100" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          </ng-container>
          
          <ng-template #sunIcon>
            <svg class="h-7 w-7 transition-all duration-500 animate-spin-slow" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 1v2m0 18v2m9-9h2M1 12H3m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" />
            </svg>
          </ng-template>
        </div>
      </button>

      <!-- Indicador de tema -->
      <div class="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-full bg-white/20 dark:bg-gray-900/30 backdrop-blur-md border border-orange-400/30 dark:border-blue-400/30 transition-all duration-500">
        <span class="text-sm font-medium text-orange-600 dark:text-blue-300 transition-colors duration-500">
          {{ isDarkMode ? '🌙 Modo Oscuro' : '☀️ Modo Claro' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin-slow {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.8s ease-out forwards;
    }

    .animate-slide-in {
      animation: slide-in 1s ease-out forwards;
    }

    .animate-spin-slow {
      animation: spin-slow 8s linear infinite;
    }

    /* Mejoras de accesibilidad */
    .group:focus-visible {
      outline: 2px solid theme('colors.orange.400');
      outline-offset: 2px;
    }

    .dark .group:focus-visible {
      outline-color: theme('colors.blue.400');
    }

    /* Transiciones suaves para cambios de tema */
    * {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-duration: 500ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class SeleccionPanelComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isDarkMode = false;

  constructor() {
    // Verificar tema guardado
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }
  }

  get userName(): string {
    return this.authService.currentUser()?.name || 'Usuario';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Efecto de transición suave
    document.documentElement.style.transition = 'all 0.5s ease-in-out';
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 500);
  }
}