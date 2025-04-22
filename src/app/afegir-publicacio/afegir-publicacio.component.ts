import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { Publicacio } from '../interfaces/publicacio';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { PublicacioService } from '../services/publicacio.service';
import { AuthService } from '../services/auth.service';
import { Interaccio } from '../interfaces/interaccio';
import { InteraccionsService } from '../services/interaccions.service';

@Component({
  selector: 'app-afegir-publicacio',
  standalone: false,
  templateUrl: './afegir-publicacio.component.html',
  styleUrl: './afegir-publicacio.component.css'
})
export class AfegirPublicacioComponent {
  publicacio: Publicacio = {
    id: 0,
    tipus: '',
    data: '',
    detalls: '',
    usuari_id: 0,
    animal_id: 0,
    created_at: '',
    updated_at: '',
    username: '',
    interaccions: []
  };
  animals: Animal[] = [];

  constructor(
    private publicacioService: PublicacioService,
    private animalPerdutService: AnimalPerdutService,
    private authService: AuthService,
    private interaccionsService: InteraccionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnimals();
  
    
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Usu autenticat carregat:', userData);
        this.publicacio.usuari_id = userData.id; 
      },
      error: (err) => {
        console.error('Error al carregar el usu autenticat:', err);
        alert('Error al carregar el usu autenticat. si us plau, try again.');
      }
    });
  }

  loadAnimals(): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        this.animals = data;
      },
      error: (err) => {
        console.error('Error al carregar els animals:', err);
      }
    });
  }

  onSubmit(): void {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

  
  
    const publicacio: Publicacio = {
      id: 0,
      tipus: this.publicacio.tipus || 'Sense titol',
      data: formattedDate,
      detalls: this.publicacio.detalls || 'Detalls no especificats.',
      usuari_id: this.publicacio.usuari_id,
      animal_id: this.publicacio.animal_id,
      created_at: '',
      updated_at: '',
      username: '', 
      interaccions: []
    };
  
    
    this.publicacioService.addPublicacio(publicacio).subscribe({
      next: (nuevaPublicacion) => {
        alert('Publicació creada amb exit.');
  
        
        const interaccioInicial: Interaccio = {
          accio: 'creación',
          data: formattedDate,
          detalls: 'S\'ha creat aquesta publicación.',
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
        this.router.navigate(['/animal-publicacio']); 
      },
      error: (err) => {
        console.error('Error al crear la publicación:', err);
        alert('Hubo un error al crear la publicación.');
      }
    });
  }
}
