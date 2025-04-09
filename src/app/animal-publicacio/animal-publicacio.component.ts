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
    this.router.navigate(['/publicacio', id]); 
  }
}