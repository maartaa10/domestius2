import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProtectoraService } from '../services/protectora.service';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Protectora } from '../interfaces/protectora';
import { Animal } from '../interfaces/animal';

@Component({
  selector: 'app-protectora-detall',
  standalone: false,
  templateUrl: './protectora-detall.component.html',
  styleUrls: ['./protectora-detall.component.css']
})
export class ProtectoraDetallComponent implements OnInit {
  protectora: Protectora | undefined;
  animals: Animal[] = [];
  errorMessage: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private protectoraService: ProtectoraService,
    private animalPerdutService: AnimalPerdutService
  ) {}

  ngOnInit(): void {
    const protectoraId = this.route.snapshot.paramMap.get('id');
    if (protectoraId) {
      this.loadProtectoraDetails(parseInt(protectoraId, 10));
      this.loadAnimals(parseInt(protectoraId, 10));
    }
  }

  loadProtectoraDetails(id: number): void {
    this.protectoraService.getProtectora(id).subscribe({
      next: (data) => {
        this.protectora = data;
  
      
        if (!this.protectora.usuari) {
          console.warn('El campo `usuari` no está presente en la respuesta del backend.');
          this.protectora.usuari = { nom: 'Usuario desconocido', email: '', password: '' };
        }
      },
      error: (err) => {
        console.error('Error al cargar los detalles de la protectora:', err);
        console.error('Detalles del error:', err.error);
  
        
        if (err.error?.message) {
          this.errorMessage = `Error del servidor: ${err.error.message}`;
        } else {
          this.errorMessage = 'No se pudieron cargar los detalles de la protectora. Por favor, inténtelo más tarde.';
        }
      }
    });
  }

  loadAnimals(protectoraId: number): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        this.animals = data.filter(animal => animal.protectora_id?.id === protectoraId);
      },
      error: (err) => {
        console.error('Error al cargar los animales:', err);
        this.errorMessage = `Error ${err.status}: ${err.error?.message || 'No se pudieron cargar los animales.'}`;
      }
    });
  }
}