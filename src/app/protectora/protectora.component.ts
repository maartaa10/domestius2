import { Component } from '@angular/core';

@Component({
  selector: 'app-protectora',
  standalone: false,
  templateUrl: './protectora.component.html',
  styleUrl: './protectora.component.css'
})
export class ProtectoraComponent {

  searchQuery: string = '';
  showFilters: boolean = false;
  filtros: string[] = ['Filtro 1', 'Filtro 2', 'Filtro 3'];

  protectoras = [
    { 
      nombre: 'Protectora 1', 
      contacto: '123456789', 
      direccion: 'Calle 1', 
      horario: '9:00 - 18:00', 
      logo: 'https://i0.wp.com/protectoragranollers.org/wp-content/uploads/2019/11/cropped-favicon.png?fit=512%2C512&ssl=1' 
    },
    { 
      nombre: 'Protectora 2', 
      contacto: '987654321', 
      direccion: 'Calle 2', 
      horario: '10:00 - 19:00', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXDQo8s5FkzuNlqvZfBkk-rhrsCtMuUyACXg&s' 
    },
    { 
      nombre: 'Prova busqueda', 
      contacto: '555555555', 
      direccion: 'Calle 3', 
      horario: '8:00 - 17:00', 
      logo: 'https://voluntariat.santcugat.cat/wp-content/uploads/2024/01/Logo-Cau-Prote-Rodo.png' 
    }
  ];

  filteredProtectoras = [...this.protectoras];

  filterProtectoras() {
    this.filteredProtectoras = this.protectoras.filter(protectora =>
      protectora.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilter(filtro: string) {
    console.log(`Filtro aplicado: ${filtro}`);
  }
}