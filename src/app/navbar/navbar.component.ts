import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private tokenService: TokenService, private router: Router) {}

  navigateToDashboardOrLogin(): void {
    if (this.tokenService.isLoggedIn()) {
      this.router.navigate(['/dashboard']); // Redirige al dashboard si está autenticado
    } else {
      this.router.navigate(['/login']); // Redirige al login si no está autenticado
    }
  }
}
