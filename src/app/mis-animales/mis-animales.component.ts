import { Component } from '@angular/core';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mis-animales',
  standalone: false,
  templateUrl: './mis-animales.component.html',
  styleUrl: './mis-animales.component.css'
})
export class MisAnimalesComponent {
  animals: Animal[] = [];
  errorMessage: string | undefined;

  constructor(
    private animalPerdutService: AnimalPerdutService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserAnimals();
  }
  
  loadUserAnimals(): void {
    const userId = this.authService.getUsuarioActualId();
    if (!userId) {
      this.errorMessage = 'No s\'ha pogut obtenir l\'ID de l\'usuari.';
      return;
    }
  
    this.animalPerdutService.getAnimalesByUsuario(userId).subscribe({
      next: (data) => {
        this.animals = data;
      },
      error: (err) => {
        console.error('Error en carregar els animals de l\'usuari:', err);
        this.errorMessage = 'No s\'han pogut carregar els teus animals. Si us plau, intenta-ho més tard.';
      }
    });
  }
}