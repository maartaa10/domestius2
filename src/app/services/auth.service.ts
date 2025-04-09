import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuari } from '../interfaces/usuari';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthCredentials } from '../models/auth-credentials.model';
import { UserRegister } from '../models/user-register.model';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiURL;
  private apiUrl = 'http://127.0.0.1:8000/api/v1/user-profile';
  private usuarioActual: Usuari | null = null;
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(credentials: AuthCredentials): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  register(user: UserRegister): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

/*   logout(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`
    });
    return this.http.delete(`${this.API_URL}/logout`, { headers });
  } */

  getUserProfile(): Observable<any> {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No se encontró un token en el almacenamiento local.');
      return new Observable(observer => {
        observer.error({ message: 'No se encontró un token.' });
      });
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.get(`${this.API_URL}/user-profile`, { headers });
  }
  
  logout(): Observable<any> {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No se encontró un token en el almacenamiento local.');
      return new Observable(observer => {
        observer.error({ message: 'No se encontró un token.' });
      });
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.delete(`${this.API_URL}/logout`, { headers });
  }
  cargarUsuarioActual(): Observable<Usuari> {
    return new Observable((observer) => {
      if (this.usuarioActual) {
        console.log('Usuario actual ya cargado:', this.usuarioActual);
        observer.next(this.usuarioActual);
        observer.complete();
      } else {
        this.http.get<Usuari>(this.apiUrl).subscribe({
          next: (usuario) => {
            console.log('Usuario autenticado cargado desde el backend:', usuario);
            this.usuarioActual = usuario;
            observer.next(usuario);
            observer.complete();
          },
          error: (err) => {
            console.error('Error al cargar el usuario actual:', err);
            observer.error(err);
          }
        });
      }
    });
  }

  getUsuarioActualId(): number {
    return this.usuarioActual?.id || 1;
  }
}