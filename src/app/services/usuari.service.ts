import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuari } from '../interfaces/usuari';
import { UsuariCreate } from '../interfaces/usuari-create';

@Injectable({
  providedIn: 'root'
})
export class UsuariService {
  private apiUrl = 'https://apidomestius-production.up.railway.app/v1';

  constructor(private http: HttpClient) {}

  registerUsuari(usuari: FormData): Observable<Usuari> {
    return this.http.post<Usuari>(`${this.apiUrl}/register`, usuari);
  }
  getUsuarioByEmail(email: string): Observable<Usuari> {
    return this.http.get<Usuari>(`${this.apiUrl}/usuari/email/${email}`);
  }
}