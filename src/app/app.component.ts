import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'domestius2';
  showFooter: boolean = false;
  showNavbar: boolean = true; // Controla la visibilidad del navbar

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Rutas donde el footer debe mostrarse
        const footerRoutes = ['/navbar', '/protectora'];
        this.showFooter = footerRoutes.includes(event.url);

        // Rutas donde el navbar NO debe mostrarse
        const noNavbarRoutes = ['/'];
        this.showNavbar = !noNavbarRoutes.includes(event.url);
      }
    });
  }
}