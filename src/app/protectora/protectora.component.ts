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
  
  // Filtros relevantes para protectoras
  filtros: string[] = [
    'Barcelona', 
    'Girona', 
    'Lleida', 
    'Tarragona', 
    'Obert caps de setmana', 
    'Obertura matí', 
    'Obertura tarda'
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
      protectora.direccion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
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
              const cpMatch = protectora.direccion.match(/\b(\d{5})\b/);
              if (cpMatch && cpMatch.length > 1) {
                const protectoraCP = parseInt(cpMatch[1]);
                return protectoraCP >= minCP && protectoraCP <= maxCP;
              }
              return false;
            }
            return false;
          }
          
          // Filtros existentes
          switch (filter) {
            case 'Barcelona':
            case 'Girona':
            case 'Lleida':
            case 'Tarragona':
              return protectora.direccion.includes(filter);
            
            case 'Obert caps de setmana':
              // Suponiendo que hay un campo o podríamos inferir esto basado en horarios
              return true; // Implementar lógica real
            
            case 'Obertura matí':
              // Verificar si abre por la mañana (antes de las 12)
              if (protectora.horario_apertura) {
                const hour = parseInt(protectora.horario_apertura.split(':')[0]);
                return hour < 12;
              }
              return false;
            
            case 'Obertura tarda':
              // Verificar si abre por la tarde (después de las 12)
              if (protectora.horario_apertura) {
                const hour = parseInt(protectora.horario_apertura.split(':')[0]);
                return hour >= 12;
              }
              return false;
              
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
}