import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { Publicacio } from '../interfaces/publicacio';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { PublicacioService } from '../services/publicacio.service';

@Component({
  selector: 'app-editar-publicacio',
  standalone: false,
  templateUrl: './editar-publicacio.component.html',
  styleUrl: './editar-publicacio.component.css'
})
export class EditarPublicacioComponent {
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
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const publicacioId = Number(this.route.snapshot.params['id']); 
    if (publicacioId) {
      this.loadPublicacio(publicacioId);
      this.loadAnimals();
    } else {
      console.error('No s\'ha proporcionat un ID de publicació vàlid.');
      this.router.navigate(['/animal-publicacio']);
    }
  }
  
  loadPublicacio(id: number): void {
    this.publicacioService.getPublicacioById(id).subscribe({
      next: (data) => {
        this.publicacio = data;
      },
      error: (err) => {
        console.error('Error al carregar la publicació:', err);
        alert('Hi ha hagut un error al carregar la publicació.');
        this.router.navigate(['/animal-publicacio']); 
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
    this.publicacioService.updatePublicacio(this.publicacio.id, this.publicacio).subscribe({
      next: () => {
        alert('Publicació actualitzada camb exit.');
        this.router.navigate(['/animal-publicacio']);
      },
      error: (err) => {
        console.error('Error al actualitzar la publi:', err);
        alert('hi ha hagut un error al actualitzar la publi.');
      }
    });
  }
}
