import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';

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
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.loadPublicacions();
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
  loadPublicacions(): void {
    this.publicacioService.getPublicacions().subscribe({
      next: (data) => {
        this.publicacions = data;
      },
      error: (err) => {
        console.error('Error al carregar les publicacions:', err);
      }
    });
  }

  navigateToPublicacio(id: number): void {
    this.router.navigate(['/publicacio', id]); 
  }
}