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

  constructor(private animalPerdutService: AnimalPerdutService) {}

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
        zoom: 8,
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
        }
      } else {
        popup.setPosition(undefined); 
      }
    });
  }

  buscarProvincia(): void {
    if (!this.searchQuery.trim()) {
      alert('Por favor, introduce una provincia.');
      return;
    }
  
    const centerCoords = this.getProvinceCenter(this.searchQuery);
    if (centerCoords) {
      this.map.getView().setCenter(fromLonLat(centerCoords)); 
      this.map.getView().setZoom(10); 
    } else {
      alert('No se pudo encontrar la provincia especificada.');
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
      console.warn(`No se encontraron límites para la provincia ${provincia}`);
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
  
    console.warn(`No se pudieron generar coordenadas válidas para la provincia ${provincia} después de ${maxAttempts} intentos. Usando punto seguro.`);
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
    const distribucionProvincias: { [key: string]: { minId: number; maxId: number } } = {
      girona: { minId: 0, maxId: 10 },
      barcelona: { minId: 11, maxId: 20 },
      tarragona: { minId: 21, maxId: 30 },
      lleida: { minId: 31, maxId: 40 },
    };
  
    const rango = distribucionProvincias[provincia.toLowerCase()];
    if (!rango) {
      console.warn(`No se encontró el rango para la provincia ${provincia}`);
      return;
    }
  
    const addedAnimalIds = new Set<number>(); 
  
    for (let id = rango.minId; id <= rango.maxId; id++) {
      this.animalPerdutService.getAnimalById(id).subscribe({
        next: (animal) => {
          if (animal && !addedAnimalIds.has(animal.id)) {
            const randomCoords = this.getRandomCoordsInProvince(provincia);
  
            if (randomCoords) {
              const marker = new Feature({
                geometry: new Point(fromLonLat(randomCoords)),
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
              addedAnimalIds.add(animal.id); 
            } else {
              console.warn(`No se pudieron generar coordenadas para la provincia ${provincia}`);
            }
          }
        },
        error: (err) => {
          console.warn(`No se pudo obtener el animal con ID ${id}:`, err);
        },
      });
    }
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