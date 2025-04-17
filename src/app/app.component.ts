import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'domestius2';
  showFooter: boolean = false;
  showNavbar: boolean = true; 

  constructor(private router: Router, private tokenService: TokenService) {
    this.checkAuthentication(); 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Navegación a:', event.url);

        const noFooterRoutes = ['/','/inici'];
        this.showFooter = !noFooterRoutes.includes(event.url);

        const noNavbarRoutes = ['/','/inici'];
        this.showNavbar = !noNavbarRoutes.includes(event.url);
      }
    });
  }

  /* private checkAuthentication(): void {
    if (this.tokenService.isLoggedIn()) {
      this.router.navigate(['/inici']);
    } else {
      this.router.navigate(['/login']); 
    }
  } */
    private checkAuthentication(): void {
      console.log('Verificación de autenticación realizada.');
      // No redirigir automáticamente al login o dashboard
    }
}