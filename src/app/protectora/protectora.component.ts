import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';

@Component({
  selector: 'app-protectora',
  standalone: false,
  templateUrl: './protectora.component.html',
  styleUrls: ['./protectora.component.css']
})
export class ProtectoraComponent implements OnInit {
  searchQuery: string = '';
  sidebarCollapsed: boolean = false;
  showFilters: boolean = false;
  showFiltersModal: boolean = false;

  // Separar los filtros en categorías para mejor organización
  provincias: string[] = ['Barcelona', 'Girona', 'Lleida', 'Tarragona'];

  // Nuevos filtros de horarios
  horarios: string[] = [
    'Obert matí (01:00-12:00)', 
    'Obert tarda (12:00-24:00)',
    'Obert ara'
  ];

  // Filtros por código postal
  codigosPostales: string[] = [
    'CP: 08001-08042 (Barcelona ciutat)',
    'CP: 08100-08298 (Barcelona àrea)',
    'CP: 17000-17899 (Girona)',
    'CP: 25000-25799 (Lleida)',
    'CP: 43000-43999 (Tarragona)'
  ];
  
  selectedFilters: string[] = [];
  protectoras: Protectora[] = [];
  filteredProtectoras: Protectora[] = [];

  constructor(private protectoraService: ProtectoraService, private router: Router) {}

  ngOnInit(): void {
    this.loadProtectoras();
    // Establecer un intervalo para actualizar el filtro "Obert ara" si está seleccionado
    setInterval(() => {
      if (this.selectedFilters.includes('Obert ara')) {
        this.filterProtectoras();
      }
    }, 60000); // Actualizar cada minuto
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadProtectoras(): void {
    this.protectoraService.getProtectoras().subscribe({
      next: (data) => {
        this.protectoras = data;
        this.filteredProtectoras = data;
      },
      error: (err) => {
        console.error('Error al carregar les protectores:', err);
      }
    });
  }

  filterProtectoras() {
    // Primero filtramos por texto de búsqueda
    let result = this.protectoras.filter(protectora =>
      protectora.direccion?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      protectora.usuari?.nom?.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      protectora.telefono?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    
    // Después aplicamos los filtros seleccionados
    if (this.selectedFilters.length > 0) {
      result = result.filter(protectora => {
        return this.selectedFilters.some(filter => {
          // Verificar si es un filtro de código postal
          if (filter.startsWith('CP:')) {
            const cpRange = filter.match(/(\d{5})-(\d{5})/);
            if (cpRange && cpRange.length === 3) {
              const minCP = parseInt(cpRange[1]);
              const maxCP = parseInt(cpRange[2]);
              
              // Extraer el código postal de la dirección
              const cpMatch = protectora.direccion?.match(/\b(\d{5})\b/);
              if (cpMatch && cpMatch.length > 1) {
                const protectoraCP = parseInt(cpMatch[1]);
                return protectoraCP >= minCP && protectoraCP <= maxCP;
              }
              return false;
            }
            return false;
          }
          
          // Filtros de provincia
          if (this.provincias.includes(filter)) {
            return protectora.direccion?.includes(filter);
          }
          
          // Nuevos filtros de horario
          switch (filter) {
            case 'Obert matí (01:00-12:00)':
              return this.estaAbiertoEnRangoHorario(protectora, 1, 12);
              
            case 'Obert tarda (12:00-24:00)':
              return this.estaAbiertoEnRangoHorario(protectora, 12, 24);
              
            case 'Obert ara':
              return this.estaAbiertoAhora(protectora);
              
            default:
              return false;
          }
        });
      });
    }
    
    this.filteredProtectoras = result;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleFiltersModal(): void {
    this.showFiltersModal = !this.showFiltersModal;
    
    if (this.showFiltersModal) {
      // Bloquea el scroll cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaura el scroll cuando el modal está cerrado
      document.body.style.overflow = 'auto';
    }
  }
  
  closeFiltersModal(): void {
    this.showFiltersModal = false;
    document.body.style.overflow = 'auto';
  }
  
  applyFilters(): void {
    this.filterProtectoras();
    this.closeFiltersModal();
  }

  removeFilter(filtro: string): void {
    this.selectedFilters = this.selectedFilters.filter(f => f !== filtro);
    this.filterProtectoras();
  }
  
  // Añadir este método para limpiar todos los filtros
  clearAllFilters(): void {
    this.selectedFilters = [];
    this.filterProtectoras();
  }

  applyFilter(filtro: string) {
    // Añadimos o quitamos el filtro del array de seleccionados
    if (this.selectedFilters.includes(filtro)) {
      this.selectedFilters = this.selectedFilters.filter(f => f !== filtro);
    } else {
      this.selectedFilters.push(filtro);
    }
    
    // Aplicamos los filtros
    this.filterProtectoras();
    
    console.log(`Filtre aplicat: ${filtro}, Filtres seleccionats: ${this.selectedFilters.join(', ')}`);
  }

  goToProtectoraDetails(protectoraId: number): void {
    this.router.navigate(['/protectora-detall', protectoraId]);
  }

  // Método auxiliar para comprobar si una protectora está abierta en un rango horario
  estaAbiertoEnRangoHorario(protectora: Protectora, horaInicio: number, horaFin: number): boolean {
    if (!protectora.horario_apertura || !protectora.horario_cierre) {
      return false;
    }
    
    const horaApertura = parseInt(protectora.horario_apertura.split(':')[0]);
    const horaCierre = parseInt(protectora.horario_cierre.split(':')[0]);
    
    // Caso normal: apertura y cierre dentro del mismo día
    if (horaApertura < horaCierre) {
      // Verificar si alguna parte del horario de apertura cae dentro del rango
      return (horaApertura < horaFin && horaCierre > horaInicio);
    } 
    // Caso especial: horario que cruza la medianoche
    else {
      // Parte antes de medianoche
      const rangoAntesMedianoche = (horaApertura < horaFin && horaApertura >= horaInicio);
      // Parte después de medianoche
      const rangoDespuesMedianoche = (horaCierre > horaInicio && horaCierre <= horaFin);
      
      return rangoAntesMedianoche || rangoDespuesMedianoche;
    }
  }

  // Método para verificar si una protectora está abierta en el momento actual
  estaAbiertoAhora(protectora: Protectora): boolean {
    if (!protectora.horario_apertura || !protectora.horario_cierre) {
      return false;
    }
    
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActual = ahora.getMinutes();
    
    const [horaApertura, minutosApertura] = protectora.horario_apertura.split(':').map(Number);
    const [horaCierre, minutosCierre] = protectora.horario_cierre.split(':').map(Number);
    
    // Convertir a minutos desde medianoche para comparación fácil
    const tiempoActual = horaActual * 60 + minutosActual;
    const tiempoApertura = horaApertura * 60 + minutosApertura;
    const tiempoCierre = horaCierre * 60 + minutosCierre;
    
    // Si el horario cruza la medianoche
    if (tiempoApertura > tiempoCierre) {
      return tiempoActual >= tiempoApertura || tiempoActual <= tiempoCierre;
    } else {
      return tiempoActual >= tiempoApertura && tiempoActual <= tiempoCierre;
    }
  }
}