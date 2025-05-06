import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';
import { Interaccio } from '../interfaces/interaccio';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { InteraccionsService } from '../services/interaccions.service';
import { AuthService } from '../services/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-publicacio-detall',
  standalone: false,
  templateUrl: './publicacio-detall.component.html',
  styleUrls: ['./publicacio-detall.component.css']
})
export class PublicacioDetallComponent implements OnInit {
  map: L.Map | null = null;

  publicacio: Publicacio | null = null;
  animal: Animal | null = null;
  interaccions: any[] = []; // Cambiado a any[] para manejar usuarios
  errorMessage: string = ''; // Añadida propiedad errorMessage
  
  novaInteraccio: Interaccio = {
    accio: '',
    data: new Date(),
    detalls: '',
    publicacio_id: 0,
    usuari_id: 0,
    tipus_interaccio_id: 1
  };
  mostrarFormulario: boolean = false;
  latitude: number = 41.3851;
  longitude: number = 2.1734;

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

        if (data.animal?.geolocalitzacio?.latitud && data.animal?.geolocalitzacio?.longitud) {
          this.latitude = parseFloat(data.animal.geolocalitzacio.latitud);
          this.longitude = parseFloat(data.animal.geolocalitzacio.longitud);
        }

        if (data.animal_id) {
          this.loadAnimalDetails(data.animal_id);
        }
        this.loadInteraccions(data.id);
      },
      error: (err) => {
        console.error('Error en carregar la publicació:', err);
        this.errorMessage = 'No s\'ha pogut carregar la publicació. Si us plau, intenta-ho més tard.';
      }
    });

    this.authService.cargarUsuarioActual().subscribe({
      next: (usuari) => {},
      error: (err) => {
        console.error('Error en carregar l\'usuari autenticat:', err);
      }
    });
  }

  initMap(): void {
    if (this.map) {
      this.map.remove();
    }
  
    this.map = L.map('map', {
      zoomControl: true, // Habilitamos los controles de zoom
      dragging: true, // Permitimos arrastrar el mapa
      scrollWheelZoom: true, // Permitimos zoom con la rueda del ratón
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      touchZoom: true,
    }).setView([this.latitude, this.longitude], 13);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      crossOrigin: 'anonymous',
    }).addTo(this.map);
  
    L.marker([this.latitude, this.longitude])
      .addTo(this.map)
      .bindPopup('Ubicació de l\'animal')
      .openPopup();
  
    // Aumentamos el tiempo de espera para asegurar que el mapa cargue correctamente
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300); // Aumentamos a 300ms
  }

  loadAnimalDetails(animalId: number): void {
    this.animalPerdutService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;

        if (this.animal.imatge && !this.animal.imatge.startsWith('http')) {
          this.animal.imatge = `http://127.0.0.1:8000/uploads/${this.animal.imatge}`;
        }

        if (this.animal.geolocalitzacio?.latitud && this.animal.geolocalitzacio?.longitud) {
          this.latitude = parseFloat(this.animal.geolocalitzacio.latitud);
          this.longitude = parseFloat(this.animal.geolocalitzacio.longitud);

          this.initMap();
        } else {
          alert('Aquest animal no te coordenades disponibles.');
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
        // Cargar información completa de interacciones con usuario
        this.interaccions = interaccions;
      },
      error: (err) => {
        console.error('Error en carregar les interaccions:', err);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    
    if (this.mostrarFormulario) {
      // Bloquear el scroll del body cuando se muestra el modal
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar el scroll cuando se cierra el modal
      document.body.style.overflow = 'auto';
    }
  }



  // Método agregarInteraccio mejorado
agregarInteraccio(): void {
  if (!this.novaInteraccio.accio || !this.novaInteraccio.detalls) {
    alert('Si us plau, completa tots els camps de la interacció.');
    return;
  }

  // Asegúrate de obtener un ID de usuario válido
  const usuariId = this.authService.getUsuarioActualId();
  if (!usuariId) {
    console.error('No se pudo obtener el ID del usuario');
    alert('No es pot afegir la interacció perquè no hi ha un usuari vàlid.');
    return;
  }

  // Formatear la fecha al formato que espera el backend (YYYY-MM-DD HH:MM:SS)
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

  // Crear el objeto de interacción
  const interaccioData = {
    accio: this.novaInteraccio.accio,
    data: formattedDate,
    detalls: this.novaInteraccio.detalls,
    publicacio_id: this.publicacio?.id || 0,
    usuari_id: usuariId,
    tipus_interaccio_id: 1
  };

  console.log('Datos de la interacción a enviar:', interaccioData);

  // Enviar la interacción al servidor
  this.interaccioService.createInteraccio(interaccioData).subscribe({
    next: (respuesta) => {
      console.log('Respuesta del servidor:', respuesta);
      alert('Interacció afegida amb èxit.');
      
      // Añadir la interacción a la lista local
      const nombreUsuario = this.authService.getNombreUsuarioActual() || 'Usuari actual';
      const interaccioConUsuario = {
        ...respuesta,
        usuari: {
          id: usuariId,
          nom: nombreUsuario
        }
      };
      
      this.interaccions.unshift(interaccioConUsuario); // Añadir al principio de la lista
      
      // Resetear el formulario
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
      console.error('Error al añadir interacción:', err);
      alert('Hi ha hagut un error en afegir la interacció. Si us plau, intenta-ho de nou.');
    }
  });
}
}