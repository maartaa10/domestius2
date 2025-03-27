import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';

@Component({
  selector: 'app-inici',
  standalone: false,
  templateUrl: './inici.component.html',
  styleUrls: ['./inici.component.css']
})
export class IniciComponent {
  protectoras: Protectora[] = []; // Lista de protectoras

  constructor(private router: Router, private protectoraService: ProtectoraService) {}

  ngOnInit(): void {
    this.loadProtectoras();
  }

  loadProtectoras(): void {
    this.protectoraService.getProtectoras().subscribe({
      next: (data) => {
        this.protectoras = data;
      },
      error: (err) => {
        console.error('Error al cargar las protectoras:', err);
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  currentSection: 'home' | 'protectora' | 'animal-perdut' = 'home';
  showProtectorInfo: boolean = false;
  showAnimalInfo: boolean = false;

  showProtector() {
    this.currentSection = 'protectora';
  }

  showAnimals() {
    this.currentSection = 'animal-perdut';
  }

  showProtectorMessage() {
    this.showProtectorInfo = true;
  }

  hideProtectorMessage() {
    this.showProtectorInfo = false;
  }
  showAnimalMessage() {
    this.showAnimalInfo = true;
  }

  hideAnimalMessage() {
    this.showAnimalInfo = false;
  }
}