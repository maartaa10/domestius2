import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { TokenService } from '../services/token.service';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-editar-animal',
  standalone: false,
  templateUrl: './editar-animal.component.html',
  styleUrl: './editar-animal.component.css',
})
export class EditarAnimalComponent implements OnInit {
  animal: Animal | null = null;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(
    private route: ActivatedRoute,
    private animalPerdutService: AnimalPerdutService,
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService
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
        console.error('Error al carregar el animal:', err);
        alert('Hubo un error al carregar el animal.');
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = input.files[0].name;
    }
  }

  getImageName(imagePath: string): string {
    if (!imagePath) return 'Sin imagen';
    return imagePath.split('/').pop() || 'imagen.jpg';
  }

  onSubmit(): void {
    if (!this.animal) {
      alert('No hi ha dades del animal per a actualitzar.');
      return;
    }
  
    const formData = new FormData();
    formData.append('nom', this.animal.nom);
    formData.append('edat', this.animal.edat?.toString() || '');
    formData.append('especie', this.animal.especie);
    formData.append('raça', this.animal.raça || '');
    formData.append('descripcio', this.animal.descripcio || '');
    formData.append('estat', this.animal.estat);
    
    // Solo añade protectora_id si existe y no es 0
    if (this.animal.protectora_id) {
      formData.append('protectora_id', this.animal.protectora_id.toString());
    }
  
    if (this.selectedFile instanceof File) {
      formData.append('imatge', this.selectedFile);
    }
  
    this.animalPerdutService.updateAnimal(this.animal.id, formData).subscribe({
      next: () => {
        alert('Animal actualitzat amb éxit.');
        this.navigateToDashboardOrLogin();
      },
      error: (err) => {
        console.error("Error al actualitzar l'animal:", err);
        alert("Error en actualizar l'animal. Si us plau, torna a provar.");
      },
    });
  }

  navigateToDashboardOrLogin(): void {
    if (this.tokenService.isLoggedIn()) {
      this.authService.getUserType().subscribe(userType => {
        if (userType === 'protectora') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      }, error => {
        console.error('Error al obtener el tipo de usuario:', error);
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.router.navigate(['/login']); 
    }
  }
}

