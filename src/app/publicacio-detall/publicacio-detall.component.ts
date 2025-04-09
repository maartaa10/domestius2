import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';
import { Interaccio } from '../interfaces/interaccio';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { InteraccionsService } from '../services/interaccions.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-publicacio-detall',
  standalone: false,
  templateUrl: './publicacio-detall.component.html',
  styleUrls: ['./publicacio-detall.component.css']
})
export class PublicacioDetallComponent implements OnInit {
  publicacio: Publicacio | null = null;
  animal: Animal | null = null;
  interaccions: Interaccio[] = []; // Inicializar como un arreglo vacío
  novaInteraccio: Interaccio = {
    accio: '',
    data: new Date(),
    detalls: '',
    publicacio_id: 0,
    usuari_id: 0, // Valor predeterminado
    tipus_interaccio_id: 1 // Valor predeterminado para el tipo de interacción
  };
  mostrarFormulario: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private publicacioService: PublicacioService,
    private animalPerdutService: AnimalPerdutService,
    private interaccioService: InteraccionsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.publicacioService.getPublicacioById(id).subscribe({
        next: (data) => {
            this.publicacio = data;

            if (data.animal_id) {
                this.loadAnimalDetails(data.animal_id);
            }

            // Cargar las interacciones de la publicación
            this.loadInteraccions(data.id);
        },
        error: (err) => {
            console.error('Error al cargar la publicación:', err);
        }
    });

    // Cargar el usuario actual al inicializar el componente
    this.authService.cargarUsuarioActual().subscribe({
        next: (usuario) => {
            console.log('Usuario autenticado cargado:', usuario);
        },
        error: (err) => {
            console.error('Error al cargar el usuario autenticado:', err);
        }
    });
  }

  loadAnimalDetails(animalId: number): void {
    this.animalPerdutService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;

        if (this.animal.imatge && !this.animal.imatge.startsWith('http')) {
          this.animal.imatge = `http://127.0.0.1:8000/uploads/${this.animal.imatge}`;
        }
      },
      error: (err) => {
        console.error('Error al cargar los detalles del animal:', err);
      }
    });
  }

  loadInteraccions(publicacioId: number): void {
    this.interaccioService.getInteraccionsByPublicacio(publicacioId).subscribe({
      next: (interaccions) => {
        this.interaccions = interaccions;
      },
      error: (err) => {
        console.error('Error al cargar las interacciones:', err);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  agregarInteraccio(): void {
    if (!this.novaInteraccio.accio || !this.novaInteraccio.detalls) {
      alert('Por favor, completa todos los campos de la interacción.');
      return;
    }
  
    // Validar usuari_id
    const usuarioId = this.authService.getUsuarioActualId();
    if (!usuarioId) {
      alert('No se puede añadir la interacción porque no hay un usuario válido.');
      return;
    }
  
    // Convertir la fecha al formato esperado por MySQL
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  
    // Asignar valores a novaInteraccio
    this.novaInteraccio.publicacio_id = this.publicacio?.id || 0;
    this.novaInteraccio.usuari_id = usuarioId;
    this.novaInteraccio.tipus_interaccio_id = 1; // Valor predeterminado para el tipo de interacción
    this.novaInteraccio.data = formattedDate; // Fecha en formato MySQL
  
    // Verificar los datos antes de enviarlos
    console.log('Datos enviados al backend:', JSON.stringify(this.novaInteraccio, null, 2));
  
    // Enviar la solicitud al backend
    this.interaccioService.createInteraccio(this.novaInteraccio).subscribe({
      next: (interaccio) => {
        alert('Interacción añadida con éxito.');
        this.interaccions.push(interaccio);
        this.novaInteraccio = {
          accio: '',
          data: new Date(),
          detalls: '',
          publicacio_id: this.publicacio?.id || 0,
          usuari_id: usuarioId,
          tipus_interaccio_id: 1 // Restablecer el valor predeterminado
        };
        this.mostrarFormulario = false;
      },
      error: (err) => {
        console.error('Error al añadir la interacción:', err);
        alert('Hubo un error al añadir la interacción. Por favor, inténtelo de nuevo.');
      }
    });
  }
}