import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { PublicacioService } from '../services/publicacio.service';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Animal } from '../interfaces/animal';
import { Publicacio } from '../interfaces/publicacio';

@Component({
  selector: 'app-user-dashboard',
  standalone: false,
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  // Datos del usuario
  userName: string = '';
  userEmail: string = '';
  userImage: string = '';
  userId: number = 0;
  
  // Estados del componente
  loading: boolean = true;
  error: string = '';
  sidebarCollapsed: boolean = false;
  activeSection: 'profile' | 'mis-animales' | 'mis-publicaciones' = 'profile';
  
  // Datos para la sección de animales
  userAnimals: Animal[] = [];
  loadingAnimals: boolean = false;
  animalsError: string = '';
  animalPage: number = 1;
  animalPageSize: number = 6;
  animalTotalPages: number = 1;
  
  // Datos para la sección de publicaciones
  userPublicaciones: Publicacio[] = [];
  loadingPublicaciones: boolean = false;
  publicacionesError: string = '';
  pubPage: number = 1;
  pubPageSize: number = 6;
  pubTotalPages: number = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private animalPerdutService: AnimalPerdutService,
    private publicacioService: PublicacioService
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
  changeSection(section: 'profile' | 'mis-animales' | 'mis-publicaciones'): void {
    this.activeSection = section;
    
    if (section === 'mis-animales') {
      this.loadAnimals();
    } else if (section === 'mis-publicaciones') {
      this.loadPublicaciones();
    }
  }

  /**
   * Carga la información del usuario
   */
  loadUserInfo(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Datos del usuario:', userData);
        this.userName = userData.nom;
        this.userEmail = userData.email;
        this.userId = userData.id;
        this.userImage = userData.imatge || 'assets/default-profile.jpg';
        this.loading = false;
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
    
    if (!this.userId) {
      this.animalsError = 'No se ha podido obtener el ID del usuario.';
      this.loadingAnimals = false;
      return;
    }

    this.animalPerdutService.getAnimalesByUsuario(this.userId).subscribe({
      next: (data) => {
        this.userAnimals = data;
        this.animalTotalPages = Math.ceil(this.userAnimals.length / this.animalPageSize);
        this.loadingAnimals = false;
      },
      error: (err) => {
        console.error('Error al cargar los animales del usuario:', err);
        this.animalsError = 'No se han podido cargar tus animales. Por favor, inténtalo más tarde.';
        this.loadingAnimals = false;
      }
    });
  }

  /**
   * Carga las publicaciones del usuario
   */
  loadPublicaciones(): void {
    this.loadingPublicaciones = true;
    this.publicacionesError = '';
    
    if (!this.userId) {
      this.publicacionesError = 'No se ha podido obtener el ID del usuario.';
      this.loadingPublicaciones = false;
      return;
    }

    this.publicacioService.getPublicacionesByUsuario(this.userId).subscribe({
      next: (data) => {
        this.userPublicaciones = data;
        this.pubTotalPages = Math.ceil(this.userPublicaciones.length / this.pubPageSize);
        this.loadingPublicaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar las publicaciones del usuario:', err);
        this.publicacionesError = 'No se han podido cargar tus publicaciones. Por favor, inténtalo más tarde.';
        this.loadingPublicaciones = false;
      }
    });
  }

  /**
   * Cambia la página actual en la paginación de animales
   */
  changeAnimalPage(delta: number): void {
    const newPage = this.animalPage + delta;
    if (newPage >= 1 && newPage <= this.animalTotalPages) {
      this.animalPage = newPage;
    }
  }

  /**
   * Cambia la página actual en la paginación de publicaciones
   */
  changePublicacionPage(delta: number): void {
    const newPage = this.pubPage + delta;
    if (newPage >= 1 && newPage <= this.pubTotalPages) {
      this.pubPage = newPage;
    }
  }

  /**
   * Obtiene los animales para la página actual
   */
  get paginatedAnimals(): Animal[] {
    const start = (this.animalPage - 1) * this.animalPageSize;
    const end = start + this.animalPageSize;
    return this.userAnimals.slice(start, end);
  }

  /**
   * Obtiene las publicaciones para la página actual
   */
  get paginatedPublicaciones(): Publicacio[] {
    const start = (this.pubPage - 1) * this.pubPageSize;
    const end = start + this.pubPageSize;
    return this.userPublicaciones.slice(start, end);
  }

  /**
   * Navega a la página de registro de un nuevo animal perdido
   */
  reportarAnimalPerdido(): void {
    this.router.navigate(['/afegir-publicacio'], { queryParams: { tipo: 'perdido' } });
  }

  /**
   * Navega a la página de edición de un animal
   */
  editarAnimal(animalId: number): void {
    this.router.navigate(['/editar-animal', animalId]);
  }

  /**
   * Navega a la página de edición de una publicación
   */
  editarPublicacion(publicacionId: number): void {
    this.router.navigate(['/editar-publicacio', publicacionId]);
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
   * Confirma y elimina una publicación
   */
  confirmDeletePublicacion(publicacionId: number): void {
    if (confirm('¿Estás seguro que quieres eliminar esta publicación?')) {
      this.publicacioService.deletePublicacio(publicacionId).subscribe({
        next: () => {
          alert('Publicación eliminada con éxito.');
          this.loadPublicaciones(); // Recargar la lista de publicaciones
        },
        error: (err) => {
          console.error('Error al eliminar la publicación:', err);
          alert('Ha habido un error al eliminar la publicación.');
        }
      });
    }
  }

  /**
   * Futura implementación para editar el perfil del usuario
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