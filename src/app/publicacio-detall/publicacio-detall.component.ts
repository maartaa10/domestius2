import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';
import { Interaccio } from '../interfaces/interaccio';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-publicacio-detall',
  standalone: false,
  templateUrl: './publicacio-detall.component.html',
  styleUrls: ['./publicacio-detall.component.css']
})
export class PublicacioDetallComponent implements OnInit {
  publicacio: Publicacio | null = null;
  animal: Animal | null = null; // Añadido para almacenar los datos del animal

  constructor(
    private route: ActivatedRoute,
    private publicacioService: PublicacioService,
    private animalPerdutService: AnimalPerdutService // Inyectamos el servicio de animales
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.publicacioService.getPublicacioById(id).subscribe({
      next: (data) => {
        this.publicacio = data;

        // Llamada adicional para obtener los detalles del animal
        if (data.animal_id) {
          this.loadAnimalDetails(data.animal_id);
        }
      },
      error: (err) => {
        console.error('Error al cargar la publicación:', err);
      }
    });
  }

  loadAnimalDetails(animalId: number): void {
    this.animalPerdutService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;

        // Si la imagen no es una URL completa, ajustamos la ruta
        if (this.animal.imatge && !this.animal.imatge.startsWith('http')) {
          this.animal.imatge = `http://127.0.0.1:8000/uploads/${this.animal.imatge}`;
        }
      },
      error: (err) => {
        console.error('Error al cargar los detalles del animal:', err);
      }
    });
  }

  get interaccions(): Interaccio[] {
    return this.publicacio?.interaccions || [];
  }
}