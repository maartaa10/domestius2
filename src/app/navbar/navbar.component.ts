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
    console.log('Inicializando NavbarComponent');
    this.checkUserStatus(); // Verificar estado inicial
    
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.authState$.subscribe((isLoggedIn) => {
      console.log('Evento de autenticación recibido en navbar:', isLoggedIn);
      this.checkUserStatus();
    });
  }
  
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  checkUserStatus(): void {
    console.log('Verificando estado del usuario en navbar');
    this.isUserLoggedIn = this.tokenService.isLoggedIn();
    console.log('¿Usuario autenticado?', this.isUserLoggedIn);
    
    if (this.isUserLoggedIn) {
      this.authService.getUserType().subscribe({
        next: userType => {
          console.log('Tipo de usuario:', userType);
          this.isUserAdmin = userType === 'admin';
          // Forzar la detección de cambios
          // Si no estás usando ChangeDetectorRef puedes omitir esta línea
          // this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error al obtener tipo de usuario:', err);
          this.isUserAdmin = false;
        }
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

  navigateToXatOrLogin(): void {
      if (this.tokenService.isLoggedIn()) {
      this.router.navigate(['/xat']);
    } else {
      this.router.navigate(['/login']); 
    }
  }
}