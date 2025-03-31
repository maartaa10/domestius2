import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';

@Component({
  selector: 'app-protectora',
  standalone: false,
  templateUrl: './protectora.component.html',
  styleUrls: ['./protectora.component.css']
})
export class ProtectoraComponent implements OnInit {
  searchQuery: string = '';
  showFilters: boolean = false;
  filtros: string[] = ['Filtro 1', 'Filtro 2', 'Filtro 3'];
  protectoras: Protectora[] = [];
  filteredProtectoras: Protectora[] = [];

  constructor(private protectoraService: ProtectoraService, private router: Router) {}

  ngOnInit(): void {
    this.loadProtectoras();
  }

  loadProtectoras(): void {
    this.protectoraService.getProtectoras().subscribe({
      next: (data) => {
        this.protectoras = data;
        this.filteredProtectoras = data;
      },
      error: (err) => {
        console.error('Error al cargar las protectoras:', err);
      }
    });
  }

  filterProtectoras() {
    this.filteredProtectoras = this.protectoras.filter(protectora =>
      protectora.direccion.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilter(filtro: string) {
    console.log(`Filtro aplicado: ${filtro}`);
  }

  goToProtectoraDetails(protectoraId: number): void {
    this.router.navigate(['/protectora-detall', protectoraId]);
  }
}