import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    // Obtenemos la información del usuario desde el servidor
    this.loading = true;
    this.authService.getUserProfile().subscribe(
      (userData) => {
        this.userName = userData.name;
        this.userEmail = userData.email;
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener datos del usuario:', error);
        this.error = 'No se pudo cargar la información del usuario';
        this.loading = false;
      }
    );
  }

  logout(): void {
    this.authService.logout().subscribe(
      response => this.handleResponse(response),
      errors => this.handleErrors(errors)
    );
  }

  private handleResponse(response: any): void {
    console.log(response.message);
    this.tokenService.revokeToken();
    this.router.navigateByUrl('/login');
  }

  private handleErrors(errors: any): void {
    console.log(errors.error);
  }
}