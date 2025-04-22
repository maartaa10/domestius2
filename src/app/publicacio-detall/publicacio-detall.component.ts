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
  interaccions: Interaccio[] = [];
  novaInteraccio: Interaccio = {
    accio: '',
    data: new Date(),
    detalls: '',
    publicacio_id: 0,
    usuari_id: 0,
    tipus_interaccio_id: 1
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
            this.loadInteraccions(data.id);
        },
        error: (err) => {
            console.error('Error en carregar la publicació:', err);
        }
    });

    this.authService.cargarUsuarioActual().subscribe({
        next: (usuari) => {
            console.log('Usuari autenticat carregat:', usuari);
        },
        error: (err) => {
            console.error('Error en carregar l\'usuari autenticat:', err);
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
        console.error('Error en carregar els detalls de l\'animal:', err);
      }
    });
  }

  loadInteraccions(publicacioId: number): void {
    this.interaccioService.getInteraccionsByPublicacio(publicacioId).subscribe({
      next: (interaccions) => {
        this.interaccions = interaccions;
      },
      error: (err) => {
        console.error('Error en carregar les interaccions:', err);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  agregarInteraccio(): void {
    if (!this.novaInteraccio.accio || !this.novaInteraccio.detalls) {
      alert('Si us plau, completa tots els camps de la interacció.');
      return;
    }

    const usuariId = this.authService.getUsuarioActualId();
    if (!usuariId) {
      alert('No es pot afegir la interacció perquè no hi ha un usuari vàlid.');
      return;
    }

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

    this.novaInteraccio.publicacio_id = this.publicacio?.id || 0;
    this.novaInteraccio.usuari_id = usuariId;
    this.novaInteraccio.tipus_interaccio_id = 1;
    this.novaInteraccio.data = formattedDate;

    console.log('Dades enviades al backend:', JSON.stringify(this.novaInteraccio, null, 2));

    this.interaccioService.createInteraccio(this.novaInteraccio).subscribe({
      next: (interaccio) => {
        alert('Interacció afegida amb èxit.');
        this.interaccions.push(interaccio);
        this.novaInteraccio = {
          accio: '',
          data: new Date(),
          detalls: '',
          publicacio_id: this.publicacio?.id || 0,
          usuari_id: usuariId,
          tipus_interaccio_id: 1
        };
        this.mostrarFormulario = false;
      },
      error: (err) => {
        console.error('Error en afegir la interacció:', err);
        alert('Hi ha hagut un error en afegir la interacció. Si us plau, intenta-ho de nou.');
      }
    });
  }
}