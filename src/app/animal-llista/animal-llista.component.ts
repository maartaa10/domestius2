import { Component } from '@angular/core';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-animal-llista',
  standalone: false,
  templateUrl: './animal-llista.component.html',
  styleUrl: './animal-llista.component.css'
})
export class AnimalLlistaComponent {
  searchQuery: string = '';
  showFilters: boolean = false;
  filtros: string[] = ['Disponible', 'En Adopción', 'Adoptado', 'En Tratamiento', 'Reservado'];
  selectedFilters: string[] = [];
  animals: Animal[] = [];
  filteredAnimals: Animal[] = [];
  router: any;

  constructor(private animalPerdutService: AnimalPerdutService) {}

  ngOnInit(): void {
    this.loadAnimals();
  }

  loadAnimals(): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.animals = data;
        this.filteredAnimals = data;
      },
      error: (err) => {
        console.error('Error al cargar los animales:', err);
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
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este animal?');
    if (!confirmDelete) {
      return;
    }

    this.animalPerdutService.deleteAnimal(id).subscribe({
      next: () => {
        alert('Animal eliminado con éxito.');
        this.loadAnimals(); // Recargar la lista de animales
      },
      error: (err) => {
        console.error('Error al eliminar el animal:', err);
        alert('Hubo un error al eliminar el animal.');
      }
    });
  }
  /* goToAnimalDetail(id: number): void {
    const selectedAnimal = this.animals.find(animal => animal.id === id);
    console.log('Animal seleccionado:', selectedAnimal);
  
    if (selectedAnimal) {
      if (selectedAnimal.estat.toLowerCase() === 'Disponible') {
        console.log('Redirigiendo a animal-publicacio');
        this.router.navigate(['/animal-publicacio', id]);
      } else if (selectedAnimal.estat.toLowerCase() === 'En Adopción') {
        console.log('Redirigiendo a animal-detall');
        this.router.navigate(['/animal-detall', id]);
      } else {
        alert('Estado del animal no reconocido.');
      }
    } else {
      console.error('Animal no encontrado con el ID:', id);
    }
  } */

}
