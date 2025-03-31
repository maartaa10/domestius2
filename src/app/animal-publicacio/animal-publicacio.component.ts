import { Component, OnInit } from '@angular/core';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Animal } from '../interfaces/animal';

@Component({
  selector: 'app-animal-publicacio',
  standalone: false,
  templateUrl: './animal-publicacio.component.html',
  styleUrls: ['./animal-publicacio.component.css']
})
export class AnimalPublicacioComponent implements OnInit {
  animals: Animal[] = []; 
  statuses: string[] = ['PERDUT', 'VIST PER ÚLTIM COP', 'TROBAT']; 

  constructor(private animalPerdutService: AnimalPerdutService) {}

  ngOnInit(): void {
    this.loadAnimals();
  }

  loadAnimals(): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        this.animals = data; 
      },
      error: (err) => {
        console.error('Error al cargar los animales:', err);
      }
    });
  }

  getStatus(index: number): string {

    return this.statuses[index % this.statuses.length];
  }

}