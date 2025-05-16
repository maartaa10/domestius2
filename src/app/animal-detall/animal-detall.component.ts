import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-animal-detall',
  standalone: false,
  templateUrl: './animal-detall.component.html',
  styleUrl: './animal-detall.component.css'
})
export class AnimalDetallComponent {
  animal: Animal | undefined;

  constructor(
    private route: ActivatedRoute,
    private animalPerdutService: AnimalPerdutService
  ) {}

  ngOnInit(): void {
    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.loadAnimalDetails(parseInt(animalId, 10));
    }
  }
  
  loadAnimalDetails(id: number): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (animals) => {
        this.animal = animals.find(animal => animal.id === id);
        if (!this.animal) {
          console.error('Animal no trobat amb l\'ID:', id);
        }
      },
      error: (err) => {
        console.error('Error en carregar els detalls de l\'animal:', err);
      }
    });
  }
}
