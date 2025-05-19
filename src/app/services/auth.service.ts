import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuari } from '../interfaces/usuari';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, mergeMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment.development';
import { AuthCredentials } from '../models/auth-credentials.model';
import { UserRegister } from '../models/user-register.model';
import { TokenService } from './token.service';
import { ProtectoraService } from './protectora.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiURL;
  private apiUrl = 'https://apidomestius-production.up.railway.app/api/v1/user-profile';
  private usuarioActual: Usuari | null = null;

  // Añadir este BehaviorSubject para emitir eventos de autenticación
  public authStateChanged = new BehaviorSubject<boolean>(false);
  
  // Observable público que otros componentes pueden escuchar
  authState$ = this.authStateChanged.asObservable();
  
  constructor(private http: HttpClient, private tokenService: TokenService, private protectoraService: ProtectoraService) {}

  login(credentials: AuthCredentials): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap(() => {
        // Emite un evento para indicar que el estado de autenticación ha cambiado
        this.authStateChanged.next(true);
      })
    );
  }

  register(user: UserRegister): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

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
  
    return this.http.delete(`${this.API_URL}/logout`, { headers }).pipe(
      tap(() => {
        // Emite un evento para indicar que el estado de autenticación ha cambiado
        this.authStateChanged.next(false);
      })
    );
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

  isAdmin(): Observable<boolean> {
    const userId = this.getUsuarioActualId();
    if (!userId) {
      return of(false);
    }
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`
    });
    
    return this.http.get<{isAdmin: boolean}>(`${environment.apiURL2}/usuario/${userId}/is-admin`, { headers })
      .pipe(
        map(response => response.isAdmin),
        catchError(error => {
          console.error('Error al verificar si el usuario es administrador:', error);
          return of(false);
        })
      );
  }
  
  getUserType(): Observable<string> {
    return this.getUserProfile().pipe(
      mergeMap(userData => {
        const userId = userData.id;
        
        return forkJoin({
          isAdmin: this.http.get<{isAdmin: boolean}>(`${environment.apiURL2}/usuario/${userId}/is-admin`, {
            headers: new HttpHeaders({
              Authorization: `Bearer ${this.tokenService.getToken()}`
            })
          }).pipe(
            map(response => response.isAdmin),
            catchError(() => of(false))
          ),
          
          hasProtectora: this.protectoraService.getProtectoraByUsuario(userId).pipe(
            map(protectora => !!protectora),
            catchError(() => of(false))
          )
        }).pipe(
          map(result => {
            console.log('Resultado de verificación de tipo de usuario:', result);
            if (result.isAdmin) {
              return 'admin';
            } else if (result.hasProtectora) {
              return 'protectora';
            } else {
              return 'usuario';
            }
          })
        );
      }),
      catchError(error => {
        console.error('Error al determinar el tipo de usuario:', error);
        return of('usuario');
      })
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

  // Método para actualizar manualmente el estado de autenticación
  updateAuthState(): void {
    this.authStateChanged.next(this.tokenService.isLoggedIn());
  }
}

