import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { ProtectoraService } from '../services/protectora.service';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Animal } from '../interfaces/animal';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Datos del usuario y protectora
  userName: string = '';
  userEmail: string = '';
  direccion: string = '';
  telefono: string = '';
  horarioApertura: string = '';
  horarioCierre: string = '';
  imatge: string = '';
  protectoraId: number = 0;
  
  // Estados del componente
  loading: boolean = true;
  error: string = '';
  sidebarCollapsed: boolean = false;
  activeSection: 'profile' | 'mis-animales' = 'profile';
  
  // Datos para la sección de animales
  userAnimals: Animal[] = [];
  loadingAnimals: boolean = false;
  animalsError: string = '';
  page: number = 1;
  pageSize: number = 6; // Número de animales por página
  totalPages: number = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private protectoraService: ProtectoraService,
    private animalPerdutService: AnimalPerdutService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  /**
   * Alterna el estado del sidebar entre colapsado y expandido
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Cambia la sección activa del dashboard
   */
  changeSection(section: 'profile' | 'mis-animales'): void {
    this.activeSection = section;
    if (section === 'mis-animales') {
      this.loadAnimals();
    }
  }

  /**
   * Carga la información del usuario y la protectora asociada
   */
  loadUserInfo(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Datos del usuario:', userData);
        this.userName = userData.nom;
        this.userEmail = userData.email;

        this.protectoraService.getProtectoraByUsuario(userData.id).subscribe({
          next: (protectoraData) => {
            console.log('Datos de la protectora:', protectoraData);
            this.protectoraId = protectoraData.id;
            this.direccion = protectoraData.direccion || 'No disponible';
            this.telefono = protectoraData.telefono || 'No disponible';
            this.horarioApertura = protectoraData.horario_apertura || 'No disponible';
            this.horarioCierre = protectoraData.horario_cierre || 'No disponible';
            this.imatge = protectoraData.imatge || 'assets/default-protectora.jpg';
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar los datos de la protectora:', err);
            this.error = 'No se ha podido cargar la información de la protectora.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los datos del usuario:', err);
        if (err.message === 'No se ha encontrado un token.') {
          this.error = 'No estás autenticado. Por favor, inicia sesión.';
          this.router.navigate(['/login']); 
        } else {
          this.error = 'No se ha podido cargar la información del usuario.';
        }
        this.loading = false;
      }
    });
  }

  /**
   * Carga los animales asociados al usuario
   */
  loadAnimals(): void {
    this.loadingAnimals = true;
    this.animalsError = '';
    
    // Verificar si la protectora tiene ID
    if (!this.protectoraId) {
      this.animalsError = 'No se ha podido obtener el ID de la protectora.';
      this.loadingAnimals = false;
      return;
    }

    this.animalPerdutService.getAnimalesByProtectora(this.protectoraId).subscribe({
      next: (data) => {
        this.userAnimals = data;
        this.totalPages = Math.ceil(this.userAnimals.length / this.pageSize);
        this.loadingAnimals = false;
      },
      error: (err) => {
        console.error('Error al cargar los animales de la protectora:', err);
        this.animalsError = 'No se han podido cargar tus animales. Por favor, inténtalo más tarde.';
        this.loadingAnimals = false;
      }
    });
  }

  /**
   * Cambia la página actual en la paginación de animales
   */
  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
    }
  }

  /**
   * Obtiene los animales para la página actual
   */
  get paginatedAnimals(): Animal[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.userAnimals.slice(start, end);
  }

  /**
   * Navega a la página de registro de un nuevo animal
   */
  navigateToRegistrarAnimal(): void {
    this.router.navigate(['/registrar-animal'], { queryParams: { protectoraId: this.protectoraId } });
  }

  /**
   * Muestra la lista de animales del usuario
   */
  verMisAnimales(): void {
    this.changeSection('mis-animales');
  }

  /**
   * Navega a la página de edición de un animal
   */
  editarAnimal(animalId: number): void {
    this.router.navigate(['/editar-animal', animalId]);
  }

  /**
   * Confirma y elimina un animal
   */
  confirmDeleteAnimal(animalId: number): void {
    if (confirm('¿Estás seguro que quieres eliminar este animal?')) {
      this.animalPerdutService.deleteAnimal(animalId).subscribe({
        next: () => {
          alert('Animal eliminado con éxito.');
          this.loadAnimals(); // Recargar la lista de animales
        },
        error: (err) => {
          console.error('Error al eliminar el animal:', err);
          alert('Ha habido un error al eliminar el animal.');
        }
      });
    }
  }

  /**
   * Navega a la página de creación de publicación para un animal
   */
  crearPublicacion(animalId: number): void {
    this.router.navigate(['/afegir-publicacio'], { queryParams: { animalId: animalId } });
  }

  /**
   * Navega a la vista detallada de un animal
   */
  verDetalleAnimal(animalId: number): void {
    this.router.navigate(['/animal-detall', animalId]);
  }

  /**
   * Futura implementación para editar el perfil de la protectora
   */
  editProfile(): void {
    alert('Funcionalidad en desarrollo');
    // Implementación futura: this.router.navigate(['/editar-perfil']);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada en el servidor');
        this.tokenService.revokeToken(); 
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        this.tokenService.revokeToken();
        this.router.navigate(['/login']); 
      }
    });
  }
}