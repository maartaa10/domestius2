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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProtectoras();
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
  
    const publicacio: Publicacio = {
      id: 0,
      tipus: this.publicacioTitulo || 'Sin título',
      data: new Date().toISOString(),
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
          data: new Date().toISOString(),
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
}