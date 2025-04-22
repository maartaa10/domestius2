import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { ProtectoraService } from '../services/protectora.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  direccion: string = '';
  telefono: string = '';
  horarioApertura: string = '';
  horarioCierre: string = '';
  imatge: string = '';
  loading: boolean = true;
  error: string = '';
  protectoraId: number = 0; 


  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private protectoraService: ProtectoraService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }
 loadUserInfo(): void {
  this.authService.getUserProfile().subscribe({
    next: (userData) => {
      console.log('Dades de l\'usuari:', userData);
      this.userName = userData.nom;
      this.userEmail = userData.email;

      this.protectoraService.getProtectoraByUsuario(userData.id).subscribe({
        next: (protectoraData) => {
          console.log('Dades de la protectora:', protectoraData);
          this.direccion = protectoraData.direccion || 'No disponible';
          this.telefono = protectoraData.telefono || 'No disponible';
          this.horarioApertura = protectoraData.horario_apertura || 'No disponible';
          this.horarioCierre = protectoraData.horario_cierre || 'No disponible';
          this.imatge = protectoraData.imatge || 'assets/default-protectora.jpg';
          this.loading = false;
        },
        error: (err) => {
          console.error('Error en carregar les dades de la protectora:', err);
          this.error = 'No sha pogut carregar la informació de la protectora.';
          this.loading = false;
        }
      });
    },
    error: (err) => {
      console.error('Error al carregar les dades del usuari:', err);
      if (err.message === 'No sha trobat un token.') {
        this.error = 'No estás autenticat. SI us plau, inicia sesiós.';
        this.router.navigate(['/login']); 
      } else {
        this.error = 'No sha pogut carregar la informació del usuari.';
      }
      this.loading = false;
    }
  });
}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesió tancada en el servidor');
        this.tokenService.revokeToken(); 
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al tancar sesió:', err);
        this.tokenService.revokeToken();
        this.router.navigate(['/login']); 
      }
    });
  }
  navigateToRegistrarAnimal(): void {
    
    this.router.navigate(['/registrar-animal'], { queryParams: { protectoraId: this.protectoraId } });
  }
  verMisAnimales(): void {
    this.router.navigate(['/mis-animales']);
  }
}