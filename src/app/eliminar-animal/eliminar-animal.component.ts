import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-eliminar-animal',
  standalone: false,
  templateUrl: './eliminar-animal.component.html',
  styleUrl: './eliminar-animal.component.css'
})
export class EliminarAnimalComponent implements OnInit {
  animalId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router, 
    private animalPerdutService: AnimalPerdutService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.params['id'];
  }

  eliminarAnimal(): void {
    if (!this.animalId) {
      alert('No hi ha un ID vàlid per eliminar.');
      return;
    }

    const confirmDelete = confirm('Estàs segur que vols eliminar aquest animal?');
    if (!confirmDelete) {
      return;
    }

    this.animalPerdutService.deleteAnimal(this.animalId).subscribe({
      next: () => {
        alert('Animal eliminat amb èxit.');
        this.router.navigate(['/animal-llista']);
      },
      error: (err) => {
        console.error('Error en eliminar l\'animal:', err);
        alert('Hi ha hagut un error en eliminar l\'animal.');
      }
    });
  }
  public cancelar(): void {
    this.router.navigate(['/animal-llista']);
  }
}