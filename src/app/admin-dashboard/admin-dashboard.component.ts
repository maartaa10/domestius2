import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Animal } from '../interfaces/animal';
import { Protectora } from '../interfaces/protectora';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  // Dades de l'usuari
  userName: string = '';
  userEmail: string = '';
  userId: number = 0;
  isAdmin: boolean = false;
  
  // Estats del component
  loading: boolean = true;
  error: string = '';
  sidebarCollapsed: boolean = false;
  activeSection: 'dashboard' | 'animals' | 'protectoras' = 'dashboard';
  
  // Dades dels animals
  animals: Animal[] = [];
  loadingAnimals: boolean = false;
  animalsError: string = '';
  searchQuery: string = '';
  filteredAnimals: Animal[] = [];
  
  // Paginació
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Dades per a l'edició al modal
  showEditModal: boolean = false;
  selectedAnimal: Animal | null = null;
  editingAnimal: Animal | null = null;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  
  // Dades per protectores
  protectoras: Protectora[] = [];
  loadingProtectoras: boolean = false;
  protectorasError: string = '';
  searchQueryProtectora: string = '';
  filteredProtectoras: Protectora[] = [];
  
  // Dades per nou formulari de protectora
  showProtectoraModal: boolean = false;
  newProtectora: Protectora = {
    id: 0,
    direccion: '',
    telefono: '',
    imatge: '',
    horario_apertura: '',
    horario_cierre: ''
  };
  
  // Per seleccionar usuari
  usuarios: any[] = [];
  selectedUsuarioId: number = 0;

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
  
  changeSection(section: 'dashboard' | 'animals' | 'protectoras'): void {
    this.activeSection = section;
    
    if (section === 'animals') {
      this.loadAnimals();
    } else if (section === 'protectoras') {
      this.loadProtectoras();
      this.loadUsuarios(); // Cargar usuarios para el formulario
    }
  }

  loadUserInfo(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.userName = userData.nom;
        this.userEmail = userData.email;
        this.userId = userData.id;
        
        // Verificar si l'usuari és admin
        this.checkIsAdmin(userData.id);
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
            this.error = 'No tens permisos d\'administrador.';
            // Redirigir després de 3 segons
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
          }
        },
        error: (err) => {
          console.error('Error en verificar si l\'usuari és administrador:', err);
          this.error = 'Error en verificar permisos d\'administrador.';
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
        console.error('Error en carregar els animals:', err);
        this.animalsError = 'No s\'han pogut carregar els animals. Si us plau, intenta-ho més tard.';
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
    return 'estat-' + estado.toLowerCase().replace(' ', '-');
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
  
  veureDetalls(animalId: number): void {
    this.router.navigate(['/animal-detall', animalId]);
  }
  
  editarAnimal(animalId: number): void {
    const animal = this.animals.find(a => a.id === animalId);
    if (animal) {
      this.selectedAnimal = animal;
      // Crear una còpia per editar (per no modificar l'original directament)
      this.editingAnimal = {...animal};
      this.selectedFileName = '';
      this.selectedFile = null;
      this.showEditModal = true;
    } else {
      console.error('No s\'ha trobat l\'animal amb ID:', animalId);
    }
  }
  
  confirmarEliminar(animalId: number): void {
    if (confirm('Estàs segur que vols eliminar aquest animal? Aquesta acció no es pot desfer.')) {
      this.animalPerdutService.deleteAnimal(animalId).subscribe({
        next: () => {
          alert('Animal eliminat amb èxit.');
          this.loadAnimals(); // Tornar a carregar la llista
        },
        error: (err) => {
          console.error('Error en eliminar l\'animal:', err);
          alert('Hi ha hagut un error en eliminar l\'animal. Si us plau, intenta-ho de nou.');
        }
      });
    }
  }

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
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedAnimal = null;
    this.editingAnimal = null;
    this.selectedFile = null;
    this.selectedFileName = '';
  }
  
  // Mètode per gestionar la selecció d'arxius
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
  
  // Mètode per desar els canvis
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
        alert('Animal actualitzat amb èxit.');
        this.loadAnimals(); // Tornar a carregar la llista d'animals
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error en actualitzar l\'animal:', err);
        alert('Hi ha hagut un error en actualitzar l\'animal. Si us plau, intenta-ho de nou.');
      }
    });
  }
  
  // Mètode per obtenir el nom de la imatge
  getImageName(imagePath: string): string {
    if (!imagePath) return 'Sense imatge';
    return imagePath.split('/').pop() || 'imatge.jpg';
  }

  // Mètode per carregar les protectores
  loadProtectoras(): void {
    this.loadingProtectoras = true;
    this.protectorasError = '';
    
    this.http.get<Protectora[]>(`${environment.apiURL2}/protectoras`).subscribe({
      next: (data) => {
        this.protectoras = data;
        this.filteredProtectoras = data;
        this.loadingProtectoras = false;
      },
      error: (err) => {
        console.error('Error al carregar les protectores:', err);
        this.protectorasError = 'No s\'han pogut carregar les protectores.';
        this.loadingProtectoras = false;
      }
    });
  }

  // Mètode per carregar els usuaris
  loadUsuarios(): void {
    this.http.get<any[]>(`${environment.apiURL2}/usuarios`).subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        console.error('Error al carregar els usuaris:', err);
      }
    });
  }

  // Mètode per mostrar el modal de nova protectora
  openNewProtectoraModal(): void {
    this.newProtectora = {
      id: 0,
      direccion: '',
      telefono: '',
      imatge: '',
      horario_apertura: '09:00',
      horario_cierre: '18:00'
    };
    this.selectedUsuarioId = 0;
    this.selectedFile = null;
    this.showProtectoraModal = true;
  }

  // Mètode per tancar el modal
  closeProtectoraModal(): void {
    this.showProtectoraModal = false;
  }

  // Mètode per crear una protectora
  createProtectora(): void {
    if (!this.selectedUsuarioId) {
      alert('Si us plau, selecciona un usuari per associar a la protectora.');
      return;
    }
    
    const formData = new FormData();
    formData.append('direccion', this.newProtectora.direccion);
    formData.append('telefono', this.newProtectora.telefono);
    formData.append('horario_apertura', this.newProtectora.horario_apertura);
    formData.append('horario_cierre', this.newProtectora.horario_cierre);
    formData.append('usuari_id', this.selectedUsuarioId.toString());
    
    if (this.selectedFile instanceof File) {
      formData.append('imatge', this.selectedFile);
    }
    
    this.http.post<any>(`${environment.apiURL2}/protectora/create`, formData).subscribe({
      next: () => {
        alert('Protectora creada amb èxit.');
        this.loadProtectoras();
        this.closeProtectoraModal();
      },
      error: (err) => {
        console.error('Error al crear la protectora:', err);
        alert('Hi ha hagut un error en crear la protectora. Si us plau, intenta-ho de nou.');
      }
    });
  }
}