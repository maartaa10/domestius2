import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';

@Component({
  selector: 'app-animal-publicacio',
  standalone: false,
  templateUrl: './animal-publicacio.component.html',
  styleUrls: ['./animal-publicacio.component.css']
})
export class AnimalPublicacioComponent implements OnInit {
  publicacions: Publicacio[] = []; // Lista de publicaciones
  selectedPublicacio: Publicacio | null = null; // Publicación seleccionada

  constructor(
    private publicacioService: PublicacioService,
    private router: Router // Inject Router here
  ) {}

  ngOnInit(): void {
    this.loadPublicacions();
  }

  loadPublicacions(): void {
    this.publicacioService.getPublicacions().subscribe({
      next: (data) => {
        this.publicacions = data;
      },
      error: (err) => {
        console.error('Error al cargar las publicaciones:', err);
      }
    });
  }

  navigateToPublicacio(id: number): void {
    this.router.navigate(['/publicacio', id]); // Use the injected Router instance
  }
}