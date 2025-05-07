import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';
import { Publicacio } from '../interfaces/publicacio';
import { Interaccio } from '../interfaces/interaccio';
import { Animal } from '../interfaces/animal';
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { InteraccionsService } from '../services/interaccions.service';
import { AuthService } from '../services/auth.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';

@Component({
  selector: 'app-publicacio-detall',
  standalone: false,
  templateUrl: './publicacio-detall.component.html',
  styleUrls: ['./publicacio-detall.component.css']
})
export class PublicacioDetallComponent implements OnInit {
  map: Map | null = null;

  publicacio: Publicacio | null = null;
  animal: Animal | null = null;
  interaccions: any[] = [];
  errorMessage: string = '';
  
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
      this.map.setTarget(undefined); // Use undefined instead of null
    }
  
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
  
    this.map = new Map({
      target: 'map', // ID of the map container
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([this.longitude, this.latitude]), // Initial coordinates
        zoom: 13, // Initial zoom level
      }),
    });
  
    // Add a marker at the animal's location
    const marker = new Feature({
      geometry: new Point(fromLonLat([this.longitude, this.latitude])),
    });
  
   /*  marker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', // Marker icon
          scale: 0.05,
        }),
      })
    ); */
  
    vectorSource.addFeature(marker);
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  agregarInteraccio(): void {
    if (!this.novaInteraccio.accio || !this.novaInteraccio.detalls) {
      alert('Si us plau, completa tots els camps de la interacció.');
      return;
    }

    const usuariId = this.authService.getUsuarioActualId();
    if (!usuariId) {
      console.error('No se pudo obtener el ID del usuario');
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

    const interaccioData = {
      accio: this.novaInteraccio.accio,
      data: formattedDate,
      detalls: this.novaInteraccio.detalls,
      publicacio_id: this.publicacio?.id || 0,
      usuari_id: usuariId,
      tipus_interaccio_id: 1
    };

    this.interaccioService.createInteraccio(interaccioData).subscribe({
      next: (respuesta) => {
        alert('Interacció afegida amb èxit.');
        const nombreUsuario = this.authService.getNombreUsuarioActual() || 'Usuari actual';
        const interaccioConUsuario = {
          ...respuesta,
          usuari: {
            id: usuariId,
            nom: nombreUsuario
          }
        };
        this.interaccions.unshift(interaccioConUsuario);
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