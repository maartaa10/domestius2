import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inici',
  standalone: false,
  templateUrl: './inici.component.html',
  styleUrls: ['./inici.component.css']
})
export class IniciComponent {
  constructor(private router: Router) {}

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