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
          console.warn('El camp `usuari` no està present en la resposta del backend.');
          this.protectora.usuari = { 
            id: 0,
            nom: 'Usuari desconegut', 
            email: 'desconegut@example.com', 
            password: '' 
          };
        }
      },
      error: (err) => {
        console.error('Error en carregar els detalls de la protectora:', err);
        console.error('Detalls de l\'error:', err.error);
        if (err.error?.message) {
          this.errorMessage = `Error del servidor: ${err.error.message}`;
        } else {
          this.errorMessage = 'No s\'han pogut carregar els detalls de la protectora. Si us plau, intenti-ho més tard.';
        }
      }
    });
  }

  loadAnimals(protectoraId: number): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        this.animals = data.filter(animal => animal.protectora_id === protectoraId);
      },
      error: (err) => {
        console.error('Error en carregar els animals:', err);
        this.errorMessage = `Error ${err.status}: ${err.error?.message || 'No s\'han pogut carregar els animals.'}`;
      }
    });
  }
}