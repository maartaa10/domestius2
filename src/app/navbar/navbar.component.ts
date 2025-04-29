import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(
    private tokenService: TokenService, 
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToDashboardOrLogin(): void {
    if (this.tokenService.isLoggedIn()) {
      // Determinar el tipo de usuario y redireccionar al dashboard correspondiente
      this.authService.getUserType().subscribe(userType => {
        if (userType === 'protectora') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      }, error => {
        console.error('Error al obtener el tipo de usuario:', error);
        // Si hay un error, redirigir al dashboard general
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.router.navigate(['/login']); 
    }
  }
}