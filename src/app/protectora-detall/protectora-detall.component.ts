import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selectedAnimalId: number | null = null; // ID del animal seleccionado

  constructor(
    private route: ActivatedRoute,
    private protectoraService: ProtectoraService,
    private animalPerdutService: AnimalPerdutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const protectoraId = this.route.snapshot.paramMap.get('id');
    if (protectoraId) {
      this.loadProtectoraDetails(parseInt(protectoraId, 10));
      this.loadAnimals(parseInt(protectoraId, 10));
    }
  }

  getEstadoClass(estado: string | undefined | null): string {
    if (!estado) return '';
    return 'estado-' + estado.toLowerCase().replace(' ', '-');
  }

  loadProtectoraDetails(id: number): void {
    this.protectoraService.getProtectora(id).subscribe({
      next: (data) => {
        this.protectora = data;
      },
      error: (err) => {
        console.error('Error en carregar els detalls de la protectora:', err);
        this.errorMessage = 'No s\'han pogut carregar els detalls de la protectora.';
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
        this.errorMessage = 'No s\'han pogut carregar els animals.';
      }
    });
  }

  navigateToAnimalDetail(animalId: number): void {
    this.selectedAnimalId = animalId; // Actualiza el ID del animal seleccionado
  }

  backToAnimalList(): void {
    this.selectedAnimalId = null; // Vuelve a la lista de animales
  }
}