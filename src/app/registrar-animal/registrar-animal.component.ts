import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';
import { Publicacio } from '../interfaces/publicacio';
import { PublicacioService } from '../services/publicacio.service';
import { Interaccio } from '../interfaces/interaccio';
import { InteraccionsService } from '../services/interaccions.service';
import { AuthService } from '../services/auth.service';

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
    protectora_id: 0,
    geolocalitzacio_id: null
  };
  ubicacion = {
    nombre: '',
    latitud: '',
    longitud: ''
  };
  selectedFile: File | null = null;
  protectorList: Protectora[] = [];
  crearPublicacio: boolean = false; 
  publicacioTitulo: string = ''; 
  publicacioDetalls: string = '';

  constructor(
    private animalPerdutService: AnimalPerdutService,
    private publicacioService: PublicacioService,
    private protectoraService: ProtectoraService,
    private interaccionsService: InteraccionsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProtectoras();
    this.setProtectoraId();
  }

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    console.log('Método onSubmit ejecutado');
    if (!this.selectedFile) {
      alert('Por favor, selecciona una imagen.');
      return;
    }
  
    if (!this.animal.protectora_id) {
      alert('No se ha asignado una protectora válida. Por favor, inténtelo de nuevo.');
      return;
    }
  
    if (!this.ubicacion.nombre || !this.ubicacion.latitud || !this.ubicacion.longitud) {
      alert('Por favor, completa todos los campos de la ubicación.');
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
  
    // Cambiar los nombres de los campos de ubicación
    formData.append('nombre', this.ubicacion.nombre);
    formData.append('latitud', this.ubicacion.latitud);
    formData.append('longitud', this.ubicacion.longitud);
  
    this.animalPerdutService.addAnimal(formData).subscribe({
      next: (animal) => {
        console.log('Animal creado:', animal);
        alert('Animal añadido con éxito');
  
        if (this.crearPublicacio) {
          this.crearPublicacion(animal);
          this.router.navigate(['/mis-animales']);
        } else {
          this.router.navigate(['/mis-animales']);
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
  
    
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  
    const publicacio: Publicacio = {
      id: 0,
      tipus: this.publicacioTitulo || 'Sin título',
      data: formattedDate, 
      detalls: this.publicacioDetalls || `Buscamos hogar para ${animal.nom}.`,
      usuari_id: animal.protectora_id,
      animal_id: animal.id,
      created_at: '',
      updated_at: '',
      username: this.getProtectoraName(animal.protectora_id),
      interaccions: []
    };
  
    this.publicacioService.addPublicacio(publicacio).subscribe({
      next: (nuevaPublicacion) => {
        alert('Publicació creada amb exit');
  
        const interaccioInicial: Interaccio = {
          accio: 'creación',
          data: formattedDate,
          detalls: 'Se ha creado esta publicación.',
          publicacio_id: nuevaPublicacion.id,
          usuari_id: nuevaPublicacion.usuari_id,
          tipus_interaccio_id: 1
        };
  
        this.interaccionsService.createInteraccio(interaccioInicial).subscribe({
          next: () => {
            console.log('Interacció inicial creada amb exit.');
          },
          error: (err) => {
            console.error('Error al crear la interacció inicial:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al crear la publicació:', err);
      }
    });
  }
  getProtectoraName(protectoraId: number): string {
    const protectora = this.protectorList.find(p => p.id === protectoraId);
    return protectora?.usuari?.nom || 'Desconegut';
  }
  setProtectoraId(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Dades de l\'usuari loguejat:', userData);
  
        const protectora = this.protectorList.find(p => p.usuari?.email === userData.email);
  
        if (protectora) {
          this.animal.protectora_id = protectora.id;
          console.log('ID de la protectora assignat automàticament:', this.animal.protectora_id);
        } else {
          console.error('L\'usuari loguejat no té una protectora associada.');
          alert('No es pot registrar un animal perquè no hi ha una protectora associada.');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error en obtenir el perfil de l\'usuari:', err);
        alert('Hi ha hagut un error en obtenir la informació de l\'usuari. Si us plau, intenta-ho de nou.');
        this.router.navigate(['/dashboard']); 
      }
    });
  }
}