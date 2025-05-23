import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  mostrarEnlaceMapa: boolean = false; // Nueva propiedad para controlar la visibilidad del enlace

  novaInteraccio: Interaccio = {
    accio: '',
    data: new Date(),
    detalls: '',
    publicacio_id: 0,
    usuari_id: 0,
    tipus_interaccio_id: 1,
    hora_creacio: new Date().toLocaleTimeString()
  };
  mostrarFormulario: boolean = false;
  latitude: number = 41.3851;
  longitude: number = 2.1734;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicacioService: PublicacioService,
    private animalPerdutService: AnimalPerdutService,
    private interaccioService: InteraccionsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
  
    // Verificar si el usuario viene desde el mapa
    const navigation = this.router.getCurrentNavigation();
    this.mostrarEnlaceMapa = !!(navigation?.extras.state && navigation.extras.state['fromMapa']);
  
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
      this.map.setTarget(undefined);
    }
  
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
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
        center: fromLonLat([this.longitude, this.latitude]), 
        zoom: 13, 
      }),
    });
  
  
    const marker = new Feature({
      geometry: new Point(fromLonLat([this.longitude, this.latitude])),
    });
  
    
  }

    // Función para sumar 2 horas a la hora de las interacciones
    sumarDosHoras(horaStr: string): string {
      if (!horaStr) return '';
      
      // Separar las partes de la hora (horas, minutos, segundos)
      const partes = horaStr.split(':');
      if (partes.length < 2) return horaStr;
      
      // Convertir la hora a número y sumar 2
      let horas = parseInt(partes[0], 10) + 2;
      
      // Manejar el formato 24h (si es mayor a 23, aplicar módulo 24)
      horas = horas % 24;
      
      // Formatear la hora para que siempre tenga 2 dígitos
      const horasStr = horas.toString().padStart(2, '0');
      
      // Reconstruir la hora con las horas modificadas
      return `${horasStr}:${partes[1]}${partes.length > 2 ? ':' + partes[2] : ''}`;
    }

  loadAnimalDetails(animalId: number): void {
    this.animalPerdutService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;

        if (this.animal.imatge && !this.animal.imatge.startsWith('http')) {
          this.animal.imatge = `http://domestius2.vercel.app/uploads/${this.animal.imatge}`;
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
      tipus_interaccio_id: 1,
      hora_creacio: now.toISOString().slice(11, 19)
    };
  
    this.interaccioService.createInteraccio(interaccioData).subscribe({
      next: () => {
        alert('Interacció afegida amb èxit.');
        
        // Reiniciar el formulario
        this.novaInteraccio = {
          accio: '',
          data: new Date(),
          detalls: '',
          publicacio_id: this.publicacio?.id || 0,
          usuari_id: usuariId,
          tipus_interaccio_id: 1,
          hora_creacio: new Date().toLocaleTimeString()
        };
        
        // Cerrar el formulario y desbloquear el scroll
        this.mostrarFormulario = false;
        document.body.style.overflow = 'auto';
        
        // Recargar las interacciones para asegurar que se muestren correctamente
        if (this.publicacio?.id) {
          this.loadInteraccions(this.publicacio.id);
        }
      },
      error: (err) => {
        console.error('Error al añadir interacción:', err);
        alert('Hi ha hagut un error en afegir la interacció. Si us plau, intenta-ho de nou.');
      }
    });
  }
}