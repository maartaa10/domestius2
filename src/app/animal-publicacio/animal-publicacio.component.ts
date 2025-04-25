import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-animal-publicacio',
  standalone: false,
  templateUrl: './animal-publicacio.component.html',
  styleUrls: ['./animal-publicacio.component.css']
})
export class AnimalPublicacioComponent implements OnInit {
  publicacions: Publicacio[] = []; 
  selectedPublicacio: Publicacio | null = null;

  constructor(
    private publicacioService: PublicacioService,
    private router: Router,
    private animalPerdutService: AnimalPerdutService 
  ) {}

  ngOnInit(): void {
    this.loadPublicacions();
  }
/*   getAnimalImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return 'assets/default-animal.jpg'; // Imagen predeterminada si no hay imagen
    }
    if (!imagePath.startsWith('http')) {
      return `http://127.0.0.1:8000/uploads/${imagePath}`;
    }
    return imagePath;
  } */
    getAnimalImageUrl(imagePath: string | null | undefined): string {
      if (!imagePath) {
        return 'assets/default-animal.jpg'; 
      }
      if (!imagePath.startsWith('http')) {
       
        return encodeURI(`http://127.0.0.1:8000/uploads/${imagePath}`);
      }
      return encodeURI(imagePath); 
    }
    
  eliminarPublicacio(publicacioId: number): void {
    if (!publicacioId) {
      alert('No es pot eliminar una publicació sense un ID vàlid.');
      return;
    }
  
    const confirmDelete = confirm('Estàs segur que vols eliminar aquesta publicació?');
    if (!confirmDelete) {
      return;
    }
  
    this.publicacioService.deletePublicacio(publicacioId).subscribe({
      next: () => {
        alert('Publicació eliminada amb èxit.');
     
        this.publicacions = this.publicacions.filter(publicacio => publicacio.id !== publicacioId);
    
        this.router.navigate(['/animal-publicacio']);
      },
      error: (err) => {
        console.error('Error al eliminar la publicació:', err);
        alert('Hi ha hagut un error al eliminar la publicació.');
      }
    });
  }
  loadAnimalImages(): void {
    this.publicacions.forEach((publicacio) => {
      if (publicacio.animal?.id) {
        this.animalPerdutService.getAnimalImatge(publicacio.animal.id).subscribe({
          next: (imageBlob: Blob) => {
            if (publicacio.animal) {
         
              const objectURL = URL.createObjectURL(imageBlob);
              publicacio.animal.imatge = objectURL;
            }
          },
          error: (err) => {
            console.error(`Error al cargar la imagen del animal con ID ${publicacio.animal?.id}:`, err);
          }
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.publicacions.forEach((publicacio) => {
      if (publicacio.animal?.imatge) {
        URL.revokeObjectURL(publicacio.animal.imatge);
      }
    });
  }
  loadPublicacions(): void {
    this.publicacioService.getPublicacions().subscribe({
      next: (data) => {
        this.publicacions = data;
        this.loadAnimalImages(); 
      },
      error: (err) => {
        console.error('Error al cargar las publicaciones:', err);
      }
    });
  }

  navigateToPublicacio(id: number): void {
    this.router.navigate(['/publicacio', id]); 
  }
}