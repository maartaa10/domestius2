import { Component } from '@angular/core';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-animal-llista',
  standalone: false,
  templateUrl: './animal-llista.component.html',
  styleUrl: './animal-llista.component.css'
})
export class AnimalLlistaComponent {
  searchQuery: string = '';
  showFilters: boolean = false;
  filtros: string[] = ['Disponible', 'En Adopció', 'Adoptat', 'En Tractament', 'Reservat'];
  selectedFilters: string[] = [];
  animals: Animal[] = [];
  filteredAnimals: Animal[] = [];
 

  constructor(private router: Router, private animalPerdutService: AnimalPerdutService) {}

  ngOnInit(): void {
    this.loadAnimals();
  }

  navigateToDetallAnimalPublicacio(animalId: number): void {
    this.router.navigate(['/detall-animal-publicacio', animalId]);
  }

  loadAnimals(): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        console.log('Dades rebudes:', data);
        this.animals = data;
        this.filteredAnimals = data;
      },
      error: (err) => {
        console.error('Error en carregar els animals:', err);
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleFilter(filtro: string) {
    if (this.selectedFilters.includes(filtro)) {
      this.selectedFilters = this.selectedFilters.filter(f => f !== filtro);
    } else {
      this.selectedFilters.push(filtro);
    }
    this.applyFilters();
  }

  applyFilters() {
    if (this.selectedFilters.length === 0) {
      this.filteredAnimals = this.animals;
    } else {
      this.filteredAnimals = this.animals.filter(animal =>
        this.selectedFilters.includes(animal.estat)
      );
    }
  }

  filterAnimals() {
    this.filteredAnimals = this.animals.filter(animal =>
      animal.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  eliminarAnimal(id: number): void {
    const confirmDelete = confirm('Estàs segur que vols eliminar aquest animal?');
    if (!confirmDelete) {
      return;
    }

    this.animalPerdutService.deleteAnimal(id).subscribe({
      next: () => {
        alert('Animal eliminat amb èxit.');
        this.loadAnimals(); // Tornar a carregar la llista d'animals
      },
      error: (err) => {
        console.error('Error en eliminar l\'animal:', err);
        alert('Hi ha hagut un error en eliminar l\'animal.');
      }
    });
  }
  /* goToAnimalDetail(id: number): void {
    const selectedAnimal = this.animals.find(animal => animal.id === id);
    console.log('Animal seleccionat:', selectedAnimal);
  
    if (selectedAnimal) {
      if (selectedAnimal.estat.toLowerCase() === 'Disponible') {
        console.log('Redirigint a animal-publicacio');
        this.router.navigate(['/animal-publicacio', id]);
      } else if (selectedAnimal.estat.toLowerCase() === 'En Adopció') {
        console.log('Redirigint a animal-detall');
        this.router.navigate(['/animal-detall', id]);
      } else {
        alert('Estat de l\'animal no reconegut.');
      }
    } else {
      console.error('Animal no trobat amb l\'ID:', id);
    }
  } */
}