import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuari } from '../interfaces/usuari';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:8000/api/v1/user-profile';
    private usuarioActual: Usuari | null = null;

    constructor(private http: HttpClient) {}

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