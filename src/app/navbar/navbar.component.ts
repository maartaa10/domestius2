import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isUserAdmin: boolean = false;
  isUserLoggedIn: boolean = false;
  private authSubscription!: Subscription;
  
  constructor(
    private tokenService: TokenService, 
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.checkUserStatus(); // Verificar estado inicial
    
    // Suscribirse a eventos de autenticación
    this.authSubscription = this.authService.authStateChanged.subscribe(() => {
      // Actualizar cuando cambie el estado de autenticación
      this.checkUserStatus();
    });
  }
  
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  checkUserStatus(): void {
    this.isUserLoggedIn = this.tokenService.isLoggedIn();
    
    if (this.isUserLoggedIn) {
      this.authService.getUserType().subscribe(userType => {
        this.isUserAdmin = userType === 'admin';
      });
    } else {
      this.isUserAdmin = false;
    }
  }

  navigateToDashboardOrLogin(): void {
    if (this.tokenService.isLoggedIn()) {
      this.authService.getUserType().subscribe(userType => {
        if (userType === 'protectora') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      }, error => {
        console.error('Error al obtener el tipo de usuario:', error);
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.router.navigate(['/login']); 
    }
  }
}