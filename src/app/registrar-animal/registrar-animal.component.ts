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
    protectora_id: 0
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
        this.router.navigate(['/mis-animales']); // Redirige a la página de "Mis Animales"
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
        alert('Publicación creada con éxito');
  
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
            console.log('Interacción inicial creada con éxito.');
          },
          error: (err) => {
            console.error('Error al crear la interacción inicial:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al crear la publicación:', err);
      }
    });
  }
  getProtectoraName(protectoraId: number): string {
    const protectora = this.protectorList.find(p => p.id === protectoraId);
    return protectora?.usuari?.nom || 'Desconocido';
  }
  setProtectoraId(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Datos del usuario logueado:', userData);
  
     
        const protectora = this.protectorList.find(p => p.usuari?.email === userData.email);
  
        if (protectora) {
          this.animal.protectora_id = protectora.id;
          console.log('ID de la protectora asignado automáticamente:', this.animal.protectora_id);
        } else {
          console.error('El usuario logueado no tiene una protectora asociada.');
          alert('No se puede registrar un animal porque no hay una protectora asociada.');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error al obtener el perfil del usuario:', err);
        alert('Hubo un error al obtener la información del usuario. Por favor, inténtelo de nuevo.');
        this.router.navigate(['/dashboard']); 
      }
    });
  }
}