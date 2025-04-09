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
}