import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  usuario = {
    nombre: 'Juan Pérez',
    correo: 'juan.perez@example.com'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada en el servidor');
        this.tokenService.revokeToken(); // Elimina el token del almacenamiento local
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        this.tokenService.revokeToken(); // Asegúrate de eliminar el token incluso si hay un error
        this.router.navigate(['/login']); // Redirige al login
      }
    });
  }
}