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
    public router: Router, // Cambiado a public
    private animalPerdutService: AnimalPerdutService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.params['id'];
  }

  eliminarAnimal(): void {
    if (!this.animalId) {
      alert('No hay un ID válido para eliminar.');
      return;
    }

    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este animal?');
    if (!confirmDelete) {
      return;
    }

    this.animalPerdutService.deleteAnimal(this.animalId).subscribe({
      next: () => {
        alert('Animal eliminado con éxito.');
        this.router.navigate(['/animal-llista']);
      },
      error: (err) => {
        console.error('Error al eliminar el animal:', err);
        alert('Hubo un error al eliminar el animal.');
      }
    });
  }
  public cancelar(): void {
    this.router.navigate(['/animal-llista']);
  }
}