import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuari } from '../interfaces/usuari';
import { Observable } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { environment } from '../environments/environment.development';
import { AuthCredentials } from '../models/auth-credentials.model';
import { UserRegister } from '../models/user-register.model';
import { TokenService } from './token.service';
import { ProtectoraService } from './protectora.service';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiURL;
  private apiUrl = 'http://127.0.0.1:8000/api/v1/user-profile';
  private usuarioActual: Usuari | null = null;
  
  constructor(private http: HttpClient, private tokenService: TokenService, private protectoraService: ProtectoraService) {}

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
      console.log('Token obtenido del localStorage:', token);
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

  getNombreUsuarioActual(): string {
    return this.usuarioActual?.nom || 'Usuari desconegut';
  }
  getUserType(): Observable<string> {
    return this.getUserProfile().pipe(
      map(userData => {
        // Verificar si el usuario está asociado a una protectora
        return this.protectoraService.getProtectoraByUsuario(userData.id).pipe(
          map(protectoraData => {
            return protectoraData ? 'protectora' : 'usuario';
          }),
          catchError(err => {
            console.error('Error al determinar el tipo de usuario:', err);
            return of('usuario'); // Por defecto, considerar como usuario estándar
          })
        );
      }),
      mergeMap(result => result) // Aplanar el Observable anidado
    );
  }

  resetPassword(email: string, token: string, passwords: { password: string; password_confirmation: string }): Observable<any> {
    const url = `${this.API_URL}/reset-password`; 
    const body = {
      email,
      token,
      password: passwords.password,
      password_confirmation: passwords.password_confirmation,
    };
  
    return this.http.post(url, body);
  }
  generatePasswordResetToken(email: string): Observable<any> {
    const url = `${this.API_URL}/password-reset`; // Endpoint del backend
    const body = { email };
  
    return this.http.post(url, body);
  }
}

