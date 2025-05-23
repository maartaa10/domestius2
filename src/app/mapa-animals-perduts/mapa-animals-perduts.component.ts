import Overlay from 'ol/Overlay';
import { Component, OnInit } from '@angular/core';
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
import { AnimalPerdutService } from '../services/animal-perdut.service';
import { NominatimService } from '../services/nominatim.service';
import { Router } from '@angular/router';
import { PublicacioService } from '../services/publicacio.service';

@Component({
  selector: 'app-mapa-animals-perduts',
  standalone: false,
  templateUrl: './mapa-animals-perduts.component.html',
  styleUrls: ['./mapa-animals-perduts.component.css']
})
export class MapaAnimalsPerdutsComponent implements OnInit {
  searchQuery: string = '';
  map!: Map;
  vectorSource!: VectorSource;

  constructor(
    private animalPerdutService: AnimalPerdutService,
    private nominatimService: NominatimService,
    private router: Router,
    private publicacioService: PublicacioService,
  ) {}

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([2.1734, 41.3851]),
        zoom: 13,
      }),
    });

    const popup = new Overlay({
      element: document.getElementById('popup')!,
      positioning: 'bottom-center',
      stopEvent: false,
    });
    this.map.addOverlay(popup);

    this.map.on('click', (event) => {
      const features = this.map.getFeaturesAtPixel(event.pixel);
      if (features && features.length > 0) {
        const feature = features[0];
        const animal = feature.get('animalData');
        const geometry = feature.getGeometry();
    
        if (animal && geometry instanceof Point) {
          const coordinates = geometry.getCoordinates();
          popup.setPosition(coordinates);
    
          const popupElement = document.getElementById('popup-content')!;
          popupElement.innerHTML = `<strong>${animal.nom}</strong><br>${animal.especie}`;
    
          popupElement.onclick = () => {
            if (animal.id) {
              // Verificar si el ID es válido antes de redirigir
              this.publicacioService.getPublicacioById(animal.id).subscribe({
                next: () => {
                  this.router.navigate(['/publicacio', animal.id]); // Navega a la página del animal
                },
                error: () => {
                  alert('La publicació no existeix o ha estat eliminada.');
                },
              });
            } else {
              alert('Aquest animal no té una publicació associada.');
            }
          };
        }
      } else {
        popup.setPosition(undefined);
      }
    });
  }

  buscarProvincia(): void {
    if (!this.searchQuery.trim()) {
      alert('Si us plau, introdueix una província.');
      return;
    }

    const centerCoords = this.getProvinceCenter(this.searchQuery);
    if (centerCoords) {
      this.map.getView().setCenter(fromLonLat(centerCoords));
      this.map.getView().setZoom(13);
    } else {
      alert('No s\'ha pogut trobar la província especificada.');
      return;
    }

    this.vectorSource.clear();
    this.mostrarAnimalesPorProvincia(this.searchQuery);
  }

  getRandomCoordsInProvince(provincia: string): [number, number] | null {
    const provinceBounds: { [key: string]: { minLon: number; maxLon: number; minLat: number; maxLat: number; safePoint: [number, number] } } = {
      barcelona: { minLon: 2.05, maxLon: 2.2, minLat: 41.35, maxLat: 41.45, safePoint: [2.15, 41.38] },
      tarragona: { minLon: 1.05, maxLon: 1.25, minLat: 41.05, maxLat: 41.15, safePoint: [1.15, 41.10] },
      girona: { minLon: 2.6, maxLon: 3.0, minLat: 41.85, maxLat: 42.2, safePoint: [2.82, 41.98] },
      lleida: { minLon: 0.6, maxLon: 0.9, minLat: 41.5, maxLat: 41.8, safePoint: [0.75, 41.65] },
    };

    const bounds = provinceBounds[provincia.toLowerCase()];
    if (!bounds) {
      console.warn(`No s'han trobat límits per a la província ${provincia}`);
      return null;
    }

    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const randomLon = Math.random() * (bounds.maxLon - bounds.minLon) + bounds.minLon;
      const randomLat = Math.random() * (bounds.maxLat - bounds.minLat) + bounds.minLat;

      if (this.isLand(provincia, randomLon, randomLat)) {
        return [randomLon, randomLat];
      }

      attempts++;
    }

    console.warn(`No s'han pogut generar coordenades vàlides per a la província ${provincia} després de ${maxAttempts} intents. S'està utilitzant un punt segur.`);
    return bounds.safePoint;
  }

  isLand(provincia: string, lon: number, lat: number): boolean {
    const provincePolygons: { [key: string]: { lon: number[]; lat: number[] } } = {
      barcelona: {
        lon: [2.05, 2.2, 2.2, 2.05],
        lat: [41.35, 41.35, 41.45, 41.45],
      },
      tarragona: {
        lon: [1.05, 1.25, 1.25, 1.05],
        lat: [41.05, 41.05, 41.15, 41.15],
      },
      girona: {
        lon: [2.6, 3.0, 3.0, 2.6],
        lat: [41.85, 41.85, 42.2, 42.2],
      },
      lleida: {
        lon: [0.6, 0.9, 0.9, 0.6],
        lat: [41.5, 41.5, 41.8, 41.8],
      },
    };

    const polygon = provincePolygons[provincia.toLowerCase()];
    if (!polygon) {
      return true;
    }

    return (
      lon >= Math.min(...polygon.lon) &&
      lon <= Math.max(...polygon.lon) &&
      lat >= Math.min(...polygon.lat) &&
      lat <= Math.max(...polygon.lat)
    );
  }

  mostrarAnimalesPorProvincia(provincia: string): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (animales) => {
        this.vectorSource.clear();

        const animalesFiltrats = animales.filter((animal) => {
          const lat = parseFloat(animal.geolocalitzacio?.latitud || '0');
          const lon = parseFloat(animal.geolocalitzacio?.longitud || '0');
          return this.isLand(provincia, lon, lat);
        });

        animalesFiltrats.forEach((animal) => {
          if (animal.id && animal.geolocalitzacio?.latitud && animal.geolocalitzacio?.longitud) {
            const coords = fromLonLat([
              parseFloat(animal.geolocalitzacio.longitud),
              parseFloat(animal.geolocalitzacio.latitud),
            ]);
        
            const marker = new Feature({
              geometry: new Point(coords),
              animalData: animal,
            });
        
            marker.setStyle(
              new Style({
                image: new Icon({
                  src: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
                  scale: 0.05,
                }),
              })
            );
        
            this.vectorSource.addFeature(marker);
          } else {
            console.warn(`L'animal amb ID ${animal.id} no té dades vàlides.`);
          }
        });
      },
      error: (err) => {
        console.error('Error en obtenir els animals:', err);
      },
    });
  }

  buscarComarcaOCiudad(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.nominatimService.getComarcasOrCities(this.searchQuery).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const firstResult = results[0];
          const centerCoords: [number, number] = [
            parseFloat(firstResult.lon),
            parseFloat(firstResult.lat),
          ];

          this.map.getView().setCenter(fromLonLat(centerCoords));
          this.map.getView().setZoom(13);

          this.mostrarAnimalesPorUbicacion(centerCoords);
        } else {
          alert('No s\'han trobat resultats per a la cerca.');
        }
      },
      error: (err) => {
        console.error('Error en cercar la comarca o ciutat:', err);
        alert('Hi ha hagut un error en cercar la comarca o ciutat. Si us plau, verifica la teva connexió o intenta amb un altre terme.');
      },
    });
  }

  mostrarAnimalesPorUbicacion(centerCoords: [number, number]): void {
    this.animalPerdutService.getAnimals().subscribe({
      next: (animales) => {
        this.vectorSource.clear();

        const animalesFiltrats = animales.filter((animal) => {
          const lat = parseFloat(animal.geolocalitzacio?.latitud || '0');
          const lon = parseFloat(animal.geolocalitzacio?.longitud || '0');
          return this.isNearby(centerCoords, [lon, lat]);
        });

        animalesFiltrats.forEach((animal) => {
          if (animal.geolocalitzacio?.latitud && animal.geolocalitzacio?.longitud) {
            const coords = fromLonLat([
              parseFloat(animal.geolocalitzacio.longitud),
              parseFloat(animal.geolocalitzacio.latitud),
            ]);

            const marker = new Feature({
              geometry: new Point(coords),
              animalData: animal,
            });

            marker.setStyle(
              new Style({
                image: new Icon({
                  src: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
                  scale: 0.05,
                }),
              })
            );

            this.vectorSource.addFeature(marker);
          } else {
            console.warn(`L'animal amb ID ${animal.id} no té coordenades vàlides.`);
          }
        });
      },
      error: (err) => {
        console.error('Error en obtenir els animals:', err);
      },
    });
  }

  isNearby(centerCoords: [number, number], animalCoords: [number, number]): boolean {
    const [centerLon, centerLat] = centerCoords;
    const [animalLon, animalLat] = animalCoords;

    const distance = Math.sqrt(
      Math.pow(centerLon - animalLon, 2) + Math.pow(centerLat - animalLat, 2)
    );

    return distance < 0.1;
  }
  getProvinceCenter(provincia: string): [number, number] | null {
   
    const provinceCenters: { [key: string]: [number, number] } = {
      barcelona: [2.1734, 41.3851],
      tarragona: [1.25, 41.1167],
      girona: [2.8249, 41.9831],
      lleida: [0.6222, 41.6167],
    };

   
    return provinceCenters[provincia.toLowerCase()] || null;
  }
}