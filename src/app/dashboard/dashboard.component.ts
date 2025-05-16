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
  // Dades de l'usuari i protectora
  userName: string = '';
  userEmail: string = '';
  direccion: string = '';
  telefono: string = '';
  horarioApertura: string = '';
  horarioCierre: string = '';
  imatge: string = '';
  protectoraId: number = 0;
  
  // Estats del component
  loading: boolean = true;
  error: string = '';
  sidebarCollapsed: boolean = false;
  activeSection: 'profile' | 'mis-animales' = 'profile';
  
  // Dades per a la secció d'animals
  userAnimals: Animal[] = [];
  loadingAnimals: boolean = false;
  animalsError: string = '';
  page: number = 1;
  pageSize: number = 6; // Nombre d'animals per pàgina
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
   * Alterna l'estat del sidebar entre col·lapsat i expandit
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Canvia la secció activa del dashboard
   */
  changeSection(section: 'profile' | 'mis-animales'): void {
    this.activeSection = section;
    if (section === 'mis-animales') {
      this.loadAnimals();
    }
  }

  /**
   * Carrega la informació de l'usuari i la protectora associada
   */
  loadUserInfo(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Dades de l\'usuari:', userData);
        this.userName = userData.nom;
        this.userEmail = userData.email;

        this.protectoraService.getProtectoraByUsuario(userData.id).subscribe({
          next: (protectoraData) => {
            console.log('Dades de la protectora:', protectoraData);
            this.protectoraId = protectoraData.id;
            this.direccion = protectoraData.direccion || 'No disponible';
            this.telefono = protectoraData.telefono || 'No disponible';
            this.horarioApertura = protectoraData.horario_apertura || 'No disponible';
            this.horarioCierre = protectoraData.horario_cierre || 'No disponible';
            this.imatge = protectoraData.imatge || 'assets/default-protectora.jpg';
            this.loading = false;
          },
          error: (err) => {
            console.error('Error en carregar les dades de la protectora:', err);
            this.error = 'No s\'ha pogut carregar la informació de la protectora.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error en carregar les dades de l\'usuari:', err);
        if (err.message === 'No s\'ha trobat un token.') {
          this.error = 'No estàs autenticat. Si us plau, inicia sessió.';
          this.router.navigate(['/login']); 
        } else {
          this.error = 'No s\'ha pogut carregar la informació de l\'usuari.';
        }
        this.loading = false;
      }
    });
  }

  /**
   * Carrega els animals associats a l'usuari
   */
  loadAnimals(): void {
    this.loadingAnimals = true;
    this.animalsError = '';
    
    // Verificar si la protectora té ID
    if (!this.protectoraId) {
      this.animalsError = 'No s\'ha pogut obtenir l\'ID de la protectora.';
      this.loadingAnimals = false;
      return;
    }
  
    // Usar getAnimals() i filtrar, igual que en protectora-detall
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        this.userAnimals = data.filter(animal => animal.protectora_id === this.protectoraId);
        this.totalPages = Math.ceil(this.userAnimals.length / this.pageSize);
        this.loadingAnimals = false;
      },
      error: (err) => {
        console.error('Error en carregar els animals de la protectora:', err);
        this.animalsError = 'No s\'han pogut carregar els teus animals. Si us plau, intenta-ho més tard.';
        this.loadingAnimals = false;
      }
    });
  }

  /**
   * Canvia la pàgina actual en la paginació d'animals
   */
  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
    }
  }

  /**
   * Obté els animals per a la pàgina actual
   */
  get paginatedAnimals(): Animal[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.userAnimals.slice(start, end);
  }

  /**
   * Navega a la pàgina de registre d'un nou animal
   */
  navigateToRegistrarAnimal(): void {
    this.router.navigate(['/registrar-animal'], { queryParams: { protectoraId: this.protectoraId } });
  }

  /**
   * Mostra la llista d'animals de l'usuari
   */
  verMisAnimales(): void {
    this.changeSection('mis-animales');
  }

  /**
   * Navega a la pàgina d'edició d'un animal
   */
  editarAnimal(animalId: number): void {
    this.router.navigate(['/editar-animal', animalId]);
  }

  /**
   * Confirma i elimina un animal
   */
  confirmDeleteAnimal(animalId: number): void {
    if (confirm('Estàs segur que vols eliminar aquest animal?')) {
      this.animalPerdutService.deleteAnimal(animalId).subscribe({
        next: () => {
          alert('Animal eliminat amb èxit.');
          this.loadAnimals(); // Tornar a carregar la llista d'animals
        },
        error: (err) => {
          console.error('Error en eliminar l\'animal:', err);
          alert('Hi ha hagut un error en eliminar l\'animal.');
        }
      });
    }
  }

  /**
   * Navega a la pàgina de creació de publicació per a un animal
   */
  crearPublicacion(animalId: number): void {
    this.router.navigate(['/afegir-publicacio'], { queryParams: { animalId: animalId } });
  }

  /**
   * Navega a la vista detallada d'un animal
   */
  verDetalleAnimal(animalId: number): void {
    this.router.navigate(['/animal-detall', animalId]);
  }

  /**
   * Futura implementació per editar el perfil de la protectora
   */
  editProfile(): void {
    alert('Funcionalitat en desenvolupament');
    // Implementació futura: this.router.navigate(['/editar-perfil']);
  }

  /**
   * Tanca la sessió de l'usuari
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sessió tancada al servidor');
        this.tokenService.revokeToken(); 
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en tancar sessió:', err);
        this.tokenService.revokeToken();
        this.router.navigate(['/login']); 
      }
    });
  }
}