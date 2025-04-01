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
  showNavbar: boolean = true; 

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        
       /*  const footerRoutes = ['/navbar', '/protectora','/registrar-animal','/perfil','/animal-llista','/animal-detall','/animal-publicacio','/protectora-detall','/publicacio-detall','/publicacio-llista','/publicacio-publicacio'];
        this.showFooter = footerRoutes.includes(event.url);
 */
        
        const noFooterRoutes = ['/'];
        this.showFooter = !noFooterRoutes.includes(event.url);

        const noNavbarRoutes = ['/'];
        this.showNavbar = !noNavbarRoutes.includes(event.url);
      }
      
    });
  }
}