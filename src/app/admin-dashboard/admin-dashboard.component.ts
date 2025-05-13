import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Animal } from '../interfaces/animal';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  // Datos del usuario
  userName: string = '';
  userEmail: string = '';
  userId: number = 0;
  isAdmin: boolean = false;
  
  // Estados del componente
  loading: boolean = true;
  error: string = '';
  sidebarCollapsed: boolean = false;
  activeSection: 'dashboard' | 'animals' = 'dashboard';
  
  // Datos de animales
  animals: Animal[] = [];
  loadingAnimals: boolean = false;
  animalsError: string = '';
  searchQuery: string = '';
  filteredAnimals: Animal[] = [];
  
  // Paginación
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Datos para edición en modal
  showEditModal: boolean = false;
  selectedAnimal: Animal | null = null;
  editingAnimal: Animal | null = null;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private http: HttpClient,
    private animalPerdutService: AnimalPerdutService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  changeSection(section: 'dashboard' | 'animals'): void {
    this.activeSection = section;
    
    if (section === 'animals') {
      this.loadAnimals();
    }
  }

  loadUserInfo(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.userName = userData.nom;
        this.userEmail = userData.email;
        this.userId = userData.id;
        
        // Verificar si el usuario es admin
        this.checkIsAdmin(userData.id);
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
  
  checkIsAdmin(userId: number): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`
    });
    
    this.http.get<{isAdmin: boolean}>(`${environment.apiURL2}/usuario/${userId}/is-admin`, { headers })
      .subscribe({
        next: (response) => {
          this.isAdmin = response.isAdmin;
          this.loading = false;
          
          if (!this.isAdmin) {
            this.error = 'No tienes permisos de administrador.';
            // Redireccionar después de 3 segundos
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
          }
        },
        error: (err) => {
          console.error('Error al verificar si el usuario es administrador:', err);
          this.error = 'Error al verificar permisos de administrador.';
          this.loading = false;
        }
      });
  }
  
  loadAnimals(): void {
    this.loadingAnimals = true;
    this.animalsError = '';
    
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        this.animals = data;
        this.filteredAnimals = data;
        this.totalPages = Math.ceil(this.animals.length / this.pageSize);
        this.loadingAnimals = false;
      },
      error: (err) => {
        console.error('Error al cargar los animales:', err);
        this.animalsError = 'No se han podido cargar los animales. Por favor, inténtalo más tarde.';
        this.loadingAnimals = false;
      }
    });
  }
  
  get paginatedAnimals(): Animal[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAnimals.slice(start, end);
  }
  
  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
    }
  }
  
  getEstadoClass(estado: string): string {
    if (!estado) return '';
    return 'estado-' + estado.toLowerCase().replace(' ', '-');
  }
  
  filterAnimals(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAnimals = this.animals;
    } else {
      const searchTermLower = this.searchQuery.toLowerCase();
      this.filteredAnimals = this.animals.filter(animal => 
        animal.nom.toLowerCase().includes(searchTermLower) ||
        animal.especie.toLowerCase().includes(searchTermLower) ||
        (animal.descripcio && animal.descripcio.toLowerCase().includes(searchTermLower)) ||
        (animal['raça'] && animal['raça'].toLowerCase().includes(searchTermLower))
      );
    }
    this.totalPages = Math.ceil(this.filteredAnimals.length / this.pageSize);
    this.page = 1;
  }
  
  verDetalles(animalId: number): void {
    this.router.navigate(['/animal-detall', animalId]);
  }
  
  editarAnimal(animalId: number): void {
    const animal = this.animals.find(a => a.id === animalId);
    if (animal) {
      this.selectedAnimal = animal;
      // Crear una copia para editar (para no modificar el original directamente)
      this.editingAnimal = {...animal};
      this.selectedFileName = '';
      this.selectedFile = null;
      this.showEditModal = true;
    } else {
      console.error('No se encontró el animal con ID:', animalId);
    }
  }
  
  confirmarEliminar(animalId: number): void {
    if (confirm('¿Estás seguro que deseas eliminar este animal? Esta acción no se puede deshacer.')) {
      this.animalPerdutService.deleteAnimal(animalId).subscribe({
        next: () => {
          alert('Animal eliminado con éxito.');
          this.loadAnimals(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar el animal:', err);
          alert('Ha ocurrido un error al eliminar el animal. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }

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
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedAnimal = null;
    this.editingAnimal = null;
    this.selectedFile = null;
    this.selectedFileName = '';
  }
  
  // Método para manejar la selección de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = input.files[0].name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }
  
  // Método para guardar los cambios
  saveChanges(): void {
    if (!this.editingAnimal) return;
    
    const formData = new FormData();
    formData.append('nom', this.editingAnimal.nom);
    formData.append('edat', this.editingAnimal.edat?.toString() || '');
    formData.append('especie', this.editingAnimal.especie);
    formData.append('raça', this.editingAnimal.raça || '');
    formData.append('descripcio', this.editingAnimal.descripcio || '');
    formData.append('estat', this.editingAnimal.estat);
    formData.append('protectora_id', this.editingAnimal.protectora_id?.toString() || '');

    if (this.selectedFile instanceof File) {
      formData.append('imatge', this.selectedFile);
    }
    
    this.animalPerdutService.updateAnimal(this.editingAnimal.id, formData).subscribe({
      next: () => {
        alert('Animal actualizado con éxito.');
        this.loadAnimals(); // Recargar la lista de animales
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error al actualizar el animal:', err);
        alert('Ha ocurrido un error al actualizar el animal. Por favor, inténtalo de nuevo.');
      }
    });
  }
  
  // Método para obtener el nombre de la imagen
  getImageName(imagePath: string): string {
    if (!imagePath) return 'Sin imagen';
    return imagePath.split('/').pop() || 'imagen.jpg';
  }
}