import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';
import { Publicacio } from '../interfaces/publicacio';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { PublicacioService } from '../services/publicacio.service';
import { AuthService } from '../services/auth.service';
import { Interaccio } from '../interfaces/interaccio';
import { InteraccionsService } from '../services/interaccions.service';

@Component({
  selector: 'app-afegir-publicacio',
  standalone: false,
  templateUrl: './afegir-publicacio.component.html',
  styleUrl: './afegir-publicacio.component.css',
})
export class AfegirPublicacioComponent {
/**
 * CREEM UN OBJECTE DE TIPO PUBLICACIO QUE CONTINDRA LES DADES DE LA PUBLICACIO
 */
publicacio: Publicacio = {
  id: 0, // ID únic de la publicació.
  tipus: '', // Tipus de la publicació (exemple: "Adopció", "Pèrdua", etc.).
  data: '', // Data de creació de la publicació.
  detalls: '', // Detalls o descripció de la publicació.
  usuari_id: 0, // ID de l'usuari que ha creat la publicació.
  animal_id: 0, // ID de l'animal associat a la publicació.
  created_at: '', 
  updated_at: '', 
  username: '', // Nom de l'usuari que ha creat la publicació.
  interaccions: [], // Llista d'interaccions associades a la publicació (ex: ha fet click, ha comentat).
};

/**
 * Llista d'animals associats a l'usuari autenticat o a la protectora.
 * Aquesta llista es carrega des del backend i s'utilitza per seleccionar un animal en una publicació.
 */
animals: Animal[] = [];

  constructor(
    private publicacioService: PublicacioService,
    private animalPerdutService: AnimalPerdutService,
    private authService: AuthService,
    private interaccionsService: InteraccionsService,
    private router: Router
  ) {}

  /**
   * Inicialitza el component carregant els animals i el perfil de l'usuari autenticat.
   */
  ngOnInit(): void {
    // Carreguem la llista d'animals associats a l'usuari autenticat.
    this.loadAnimals();

    // Obtenim el perfil de l'usuari autenticat.
    this.authService.getUserProfile().subscribe({
      // Si la crida és exitosa:
      next: (userData) => {
        console.log('Usuari autenticat carregat:', userData);

        // Assignem l'ID de l'usuari autenticat a la publicació.
        this.publicacio.usuari_id = userData.id;
      },
      // Si hi ha un error en obtenir el perfil de l'usuari:
      error: (err) => {
        console.error("Error al carregar l'usuari autenticat:", err);

        // Mostrem un missatge d'alerta per informar de l'error.
        alert(
          "Error al carregar l'usuari autenticat. Si us plau, torna-ho a intentar."
        );
      },
    });
  }

  /**
   * Carrega la llista d'animals associats a la protectora de l'usuari autenticat.
   */
  loadAnimals(): void {
    // Obtenim el perfil de l'usuari autenticat.
    this.authService.getUserProfile().subscribe({
      // Si la crida és ok (amb exit):
      next: (userData) => {
        const userId = userData.id; // Obtenim l'ID de l'usuari.

        // Carreguem els animals associats a la protectora de l'usuari.
        this.animalPerdutService.getAnimalesByProtectora(userId).subscribe({
          // Si la crida és ok (amb exit):
          next: (data) => {
            // Assignem la llista d'animals carregats.
            this.animals = data;
          },
          // Si hi ha un error en carregar els animals:
          error: (err) => {
            console.error("Error al carregar els animals de l'usuari:", err);

            // Mostrem un missatge d'alerta per informar de l'error.
            alert(
              "No s'ha pogut carregar els animals. Si us plau, intenta-ho més tard."
            );
          },
        });
      },
      // Si hi ha un error en obtenir el perfil de l'usuari:
      error: (err) => {
        console.error("Error al obtenir el perfil de l'usuari:", err);

        // Mostrem un missatge d'alerta per informar de l'error.
        alert("No s'ha pogut carregar la informació de l'usuari.");
      },
    });
  }

  /**
 * Envia el formulari per crear una nova publicació i registra una interacció inicial.
 */
onSubmit(): void {
  // Obtenim la data i hora actual en format ISO.
  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

  // Creem un objecte de tipus Publicacio amb les dades del formulari.
  const publicacio: Publicacio = {
    id: 0,
    tipus: this.publicacio.tipus || 'Sense titol', // Assignem un títol per defecte si no s'ha especificat.
    data: formattedDate, // Assignem la data actual.
    detalls: this.publicacio.detalls || 'Detalls no especificats.', // Assignem detalls per defecte si no s'han especificat.
    usuari_id: this.publicacio.usuari_id, // Assignem l'ID de l'usuari autenticat.
    animal_id: this.publicacio.animal_id, // Assignem l'ID de l'animal seleccionat.
    created_at: '',
    updated_at: '',
    username: '',
    interaccions: []
  };

  // Enviem la publicació al servei per crear-la.
  this.publicacioService.addPublicacio(publicacio).subscribe({
    // Si la publicació es crea correctament:
    next: (nuevaPublicacion) => {
      // Mostrem un missatge d'èxit.
      alert('Publicació creada amb èxit.');

      // Creem una interacció inicial per registrar la creació de la publicació. (SI ES MARCA CHECKBOX ES CREARA AUTOMATICAMENT UNA PRIMERA INTERACCIO DE TIPO CREACIO)
      const interaccioInicial: Interaccio = {
        accio: 'creación', // Especifica l'acció com a "creació".
        data: formattedDate, // Assignem la data actual.
        detalls: 'S\'ha creat aquesta publicació.', // Detalls de la interacció.
        publicacio_id: nuevaPublicacion.id, // Assignem l'ID de la publicació creada.
        usuari_id: nuevaPublicacion.usuari_id, // Assignem l'ID de l'usuari que ha creat la publicació.
        tipus_interaccio_id: 1, // Assignem un tipus d'interacció (1 = creació).
        hora_creacio: now.toISOString().slice(11, 19) // Assignem l'hora actual.
      };

      // Enviem la interacció inicial al servei per registrar-la.
      this.interaccionsService.createInteraccio(interaccioInicial).subscribe({
        // Si la interacció es crea correctament:
        next: () => {
          console.log('Interacció inicial creada amb èxit.');
        },
        // Si hi ha un error en crear la interacció:
        error: (err) => {
          console.error('Error al crear la interacció inicial:', err);
        }
      });

      // Redirigim l'usuari a la pàgina de publicacions d'animals.
      this.router.navigate(['/animal-publicacio']);
    },
    // Si hi ha un error en crear la publicació:
    error: (err) => {
      console.error('Error al crear la publicació:', err);

      // Mostrem un missatge d'alerta per informar de l'error.
      alert('Hi ha hagut un error al crear la publicació.');
    }
  });
}
}
