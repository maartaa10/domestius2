import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';
import { PublicacioService } from '../services/publicacio.service';
import { InteraccionsService } from '../services/interaccions.service';
import { AuthService } from '../services/auth.service';
import { Publicacio } from '../interfaces/publicacio';
import { Interaccio } from '../interfaces/interaccio';
import { PhotonService } from '../services/photon.service';
import { debounceTime } from 'rxjs';

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
  sugerencias: any[] = []; 
  selectedFile: File | null = null;
  protectorList: Protectora[] = [];
  crearPublicacio: boolean = false;
  publicacioTitulo: string = '';
  publicacioDetalls: string = '';
  isProtectora: boolean = false;
  userId: number = 0;
selectedFileName: string | null = null;

  

  constructor(
    private animalPerdutService: AnimalPerdutService,
    private publicacioService: PublicacioService,
    private protectoraService: ProtectoraService,
    private interaccionsService: InteraccionsService,
    private authService: AuthService,
    private router: Router,
    private photonService: PhotonService
  ) {}

  ngOnInit(): void {
    this.loadProtectoras();
    this.determineUserType();
  }

  determineUserType(): void {
    this.authService.getUserProfile().pipe(debounceTime(500)).subscribe({
      next: (userData) => {
        console.log('Dades de l\'usuari loguejat:', userData);
        this.userId = userData.id;
  
        // Comprobar si el usuario es una protectora
        this.authService.getUserType().pipe(debounceTime(500)).subscribe(userType => {
          this.isProtectora = userType === 'protectora';
  
          if (this.isProtectora) {
            const protectora = this.protectorList.find(p => p.usuari?.email === userData.email);
            if (protectora) {
              this.animal.protectora_id = protectora.id;
              console.log('ID de la protectora assignat:', this.animal.protectora_id);
            }
          } else {
            this.animal.protectora_id = 0;
            console.log('Usuari normal, no té protectora associada');
          }
        });
      },
      error: (err) => {
        console.error('Error en obtenir el perfil de l\'usuari:', err);
        alert('Hi ha hagut un error en obtenir la informació de l\'usuari.');
      }
    });
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
      this.selectedFileName = this.selectedFile.name;
    }
  }

  onSubmit(): void {
    console.log('Método onSubmit ejecutado');
    if (!this.selectedFile) {
      alert('Por favor, selecciona una imagen.');
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
    
    // Usamos protectora_id si es una protectora, o el id de usuario si es usuario normal
    if (this.isProtectora) {
      formData.append('protectora_id', this.animal.protectora_id.toString());
    } else {
      formData.append('usuari_id', this.userId.toString());
    }
    
    formData.append('imatge', this.selectedFile);
  
    formData.append('nombre', this.ubicacion.nombre);
    formData.append('latitud', this.ubicacion.latitud);
    formData.append('longitud', this.ubicacion.longitud);
  
    this.animalPerdutService.addAnimal(formData).subscribe({
      next: (animal) => {
        console.log('Animal creado:', animal);
        alert('Animal añadido con éxito');
  
        if (this.crearPublicacio) {
          this.crearPublicacion(animal);
        }
        
        // Redirección según el tipo de usuario
        if (this.isProtectora) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
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
      usuari_id: this.userId,
      animal_id: animal.id,
      created_at: '',
      updated_at: '',
      username: '',
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
          tipus_interaccio_id: 1,
          hora_creacio: new Date().toLocaleTimeString()
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
        alert('Error al crear la publicació');
      }
    });
  }

  getProtectoraName(protectoraId: number): string {
    const protectora = this.protectorList.find(p => p.id === protectoraId);
    return protectora?.usuari?.nom || 'Desconegut';
  }
  buscarUbicacion(query: string): void {
    if (query.length > 2) {
      this.photonService.search(query).subscribe({
        next: (response) => {
          this.sugerencias = response.features.map((feature: any) => ({
            nombre: feature.properties.name,
            direccion: feature.properties.city || feature.properties.state || '',
            latitud: feature.geometry.coordinates[1],
            longitud: feature.geometry.coordinates[0],
          }));
        },
        error: (err) => {
          console.error('Error al buscar ubicaciones:', err);
        },
      });
    } else {
      this.sugerencias = [];
    }
  }

  seleccionarUbicacion(sugerencia: any): void {
    this.ubicacion.nombre = `${sugerencia.nombre}, ${sugerencia.direccion}`;
    this.ubicacion.latitud = sugerencia.latitud;
    this.ubicacion.longitud = sugerencia.longitud;
    this.sugerencias = []; // Limpiar las sugerencias después de seleccionar
  }
}