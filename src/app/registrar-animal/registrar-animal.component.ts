import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';
import { Publicacio } from '../interfaces/publicacio';
import { PublicacioService } from '../services/publicacio.service';
import { AuthService } from '../services/auth.service'; // Importar AuthService

@Component({
  selector: 'app-registrar-animal',
  standalone: false,
  templateUrl: './registrar-animal.component.html',
  styleUrls: ['./registrar-animal.component.css']
})
export class RegistrarAnimalComponent {
  animal: Animal = {
    id: 0,
    nom: '',
    edat: null,
    especie: '',
    raça: null,
    descripcio: null,
    estat: 'Disponible',
    imatge: null,
    protectora_id: 0
  };

  selectedFile: File | null = null; // Archivo seleccionado
  protectorList: Protectora[] = [];
  crearPublicacio: boolean = false; // Estado del checkbox
  publicacioDetalls: string = ''; // Detalles de la publicación

  constructor(
    private animalPerdutService: AnimalPerdutService,
    private publicacioService: PublicacioService,
    private protectoraService: ProtectoraService,
    private authService: AuthService, // Servicio para obtener el usuario logueado
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProtectoras();
    this.setProtectoraId(); // Asignar automáticamente la protectora logueada
  }

  /**
   * Carga la lista de protectoras disponibles.
   */
  loadProtectoras(): void {
    this.protectoraService.getProtectoras().subscribe({
      next: (data) => {
        this.protectorList = data;
      },
      error: (err) => {
        console.error('Error al cargar las protectoras:', err);
      }
    });
  }

  /**
   * Asigna automáticamente el ID de la protectora logueada al campo `protectora_id`.
   */
  setProtectoraId(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Datos del usuario logueado:', userData);
  
        // Busca la protectora asociada al usuario logueado usando el email
        const protectora = this.protectorList.find(p => p.usuari?.email === userData.email);
  
        if (protectora) {
          this.animal.protectora_id = protectora.id; // Asigna el ID de la protectora
          console.log('ID de la protectora asignado automáticamente:', this.animal.protectora_id);
        } else {
          console.error('El usuario logueado no tiene una protectora asociada.');
          alert('No se puede registrar un animal porque no hay una protectora asociada.');
          this.router.navigate(['/dashboard']); // Redirige al dashboard si no hay protectora
        }
      },
      error: (err) => {
        console.error('Error al obtener el perfil del usuario:', err);
        alert('Hubo un error al obtener la información del usuario. Por favor, inténtelo de nuevo.');
        this.router.navigate(['/dashboard']); // Redirige al dashboard en caso de error
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      alert('Por favor, selecciona una imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.animal.nom);
    formData.append('edat', this.animal.edat?.toString() || '');
    formData.append('especie', this.animal.especie);
    formData.append('raça', this.animal.raça || '');
    formData.append('descripcio', this.animal.descripcio || '');
    formData.append('estat', this.animal.estat);
    formData.append('protectora_id', this.animal.protectora_id.toString());
    formData.append('imatge', this.selectedFile);

    this.animalPerdutService.addAnimal(formData).subscribe({
      next: (animal) => {
        console.log('Animal creado:', animal); 
        alert('Animal añadido con éxito');
    
        if (this.crearPublicacio) {
          if (animal.id) {
            this.crearPublicacion(animal); 
          } else {
            console.error('El animal no tiene un ID válido:', animal);
            alert('No se pudo crear la publicación porque el animal no tiene un ID válido.');
          }
        } else {
          this.router.navigate(['/animal-llista']);
        }
      },
      error: (err) => {
        console.error('Error al añadir el animal:', err);
        alert('Hubo un error al añadir el animal. Por favor, inténtelo de nuevo.');
      }
    });
  }

  crearPublicacion(animal: Animal): void {
    if (!animal.id) {
      console.error('El animal no tiene un ID válido:', animal);
      alert('No se puede crear la publicación porque el animal no tiene un ID válido.');
      return;
    }
  
    console.log('Creando publicación para el animal con ID:', animal.id);
  
    const publicacio: Publicacio = {
      id: 0,
      tipus: 'Adopción',
      data: new Date().toISOString().split('T')[0],
      detalls: this.publicacioDetalls || `Buscamos hogar para ${animal.nom}.`,
      usuari_id: animal.protectora_id,
      animal_id: animal.id, 
      created_at: '',
      updated_at: '',
      username: this.getProtectoraName(animal.protectora_id),
      interaccions: [
        {
          accio: 'crear publicacion',
          data: new Date(),
          detalls: 'Se ha creado la publicación para este animal.'
        }
      ]
    };
  
    this.publicacioService.addPublicacio(publicacio).subscribe({
      next: () => {
        alert('Publicación creada con éxito');
        this.router.navigate(['/animal-llista']);
      },
      error: (err) => {
        console.error('Error al crear la publicación:', err);
        alert('Hubo un error al crear la publicación. Por favor, inténtelo de nuevo.');
      }
    });
  }

  getProtectoraName(protectoraId: number): string {
    const protectora = this.protectorList.find(p => p.id === protectoraId);
    return protectora?.usuari?.nom || 'Desconocido';
  }
}