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
        console.log('Datos del usuario:', userData);
        this.userName = userData.nom;
        this.userEmail = userData.email;
  
        this.protectoraService.getProtectoraByUsuario(userData.id).subscribe({
          next: (protectoraData) => {
            console.log('Datos de la protectora:', protectoraData);
            this.direccion = protectoraData.direccion || 'No disponible';
            this.telefono = protectoraData.telefono || 'No disponible';
            this.horarioApertura = protectoraData.horario_apertura || 'No disponible';
            this.horarioCierre = protectoraData.horario_cierre || 'No disponible';
            this.imatge = protectoraData.imatge || 'assets/default-protectora.jpg';
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar los datos de la protectora:', err);
            this.error = 'No se pudo cargar la información de la protectora.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los datos del usuario:', err);
        this.error = 'No se pudo cargar la información del usuario.';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }
}