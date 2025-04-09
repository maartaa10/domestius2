import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-editar-animal',
  standalone: false,
  templateUrl: './editar-animal.component.html',
  styleUrl: './editar-animal.component.css'
})
export class EditarAnimalComponent implements OnInit {
  animal: Animal | null = null;
  selectedFile: File | null = null; // Add this property to store the selected file

  constructor(
    private route: ActivatedRoute,
    private animalPerdutService: AnimalPerdutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadAnimal(id);
  }

  loadAnimal(id: number): void {
    this.animalPerdutService.getAnimalById(id).subscribe({
      next: (data) => {
        this.animal = data;
      },
      error: (err) => {
        console.error('Error al cargar el animal:', err);
        alert('Hubo un error al cargar el animal.');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (!this.animal) {
      alert('No hay datos del animal para actualizar.');
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.animal.nom);
    formData.append('edat', this.animal.edat?.toString() || '');
    formData.append('especie', this.animal.especie);
    formData.append('raça', this.animal.raça || '');
    formData.append('descripcio', this.animal.descripcio || '');
    formData.append('estat', this.animal.estat);
    formData.append('protectora_id', this.animal.protectora_id.toString());

    // Only append 'imatge' if a new file is selected
    if (this.selectedFile instanceof File) {
      formData.append('imatge', this.selectedFile);
    }

    this.animalPerdutService.updateAnimal(this.animal.id, formData).subscribe({
      next: () => {
        alert('Animal actualizado con éxito.');
        this.router.navigate(['/animal-llista']);
      },
      error: (err) => {
        console.error('Error al actualizar el animal:', err);
        alert('Hubo un error al actualizar el animal. Por favor, inténtelo de nuevo.');
      }
    });
  }
}