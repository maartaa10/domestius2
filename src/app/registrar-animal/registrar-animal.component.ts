import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';

@Component({
  selector: 'app-registrar-animal',
  standalone: false,
  templateUrl: './registrar-animal.component.html',
  styleUrl: './registrar-animal.component.css'
})
export class RegistrarAnimalComponent {
  animal: Animal = {
    id: 0,
    nom: '',
    edat: null,
    especie: '',
    raça: null,
    descripcio: null,
    estat: 'Disponible',
    imatge: null,
    protectora_id: 0
  };

  protectorList: Protectora[] = []; 

  constructor(
    private animalPerdutService: AnimalPerdutService,
    private protectoraService: ProtectoraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProtectoras();
  }

  loadProtectoras(): void {
    this.protectoraService.getProtectoras().subscribe({
      next: (data) => {
        this.protectorList = data;
      },
      error: (err) => {
        console.error('Error al cargar las protectoras:', err);
      }
    });
  }

  onSubmit(): void {
    this.animalPerdutService.addAnimal(this.animal).subscribe({
      next: () => {
        alert('Animal añadido con éxito');
        this.router.navigate(['/animal-llista']);
      },
      error: (err) => {
        console.error('Error al añadir el animal:', err);
        if (err.error && err.error.message) {
          alert(`Error: ${err.error.message}`);
        } else {
          alert('Hubo un error al añadir el animal. Por favor, inténtelo de nuevo.');
        }
      }
    });
  }
}
