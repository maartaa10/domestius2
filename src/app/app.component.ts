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
        
        const footerRoutes = ['/navbar', '/protectora'];
        this.showFooter = footerRoutes.includes(event.url);

        
        const noNavbarRoutes = ['/'];
        this.showNavbar = !noNavbarRoutes.includes(event.url);
      }
    });
  }
}