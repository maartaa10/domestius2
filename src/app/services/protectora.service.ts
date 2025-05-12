import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Protectora } from '../interfaces/protectora';

@Injectable({
  providedIn: 'root'
})
export class ProtectoraService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getProtectoras(): Observable<Protectora[]> {
    return this.http.get<Protectora[]>(`${this.apiUrl}/protectoras`);
  }
  getProtectora(id: number): Observable<Protectora> {
    return this.http.get<Protectora>(`${this.apiUrl}/protectora/get/${id}`);
  }
  getProtectoraByUsuario(usuarioId: number): Observable<Protectora> {
    console.log('Llamando al endpoint /api/protectora/usuario con ID:', usuarioId);
    return this.http.get<Protectora>(`http://127.0.0.1:8000/api/protectora/usuario/${usuarioId}`).pipe(
      tap((response) => console.log('Respuesta del endpoint /api/protectora/usuario:', response)),
      catchError((error) => {
        console.error('Error al obtener la protectora:', error);
        return throwError(() => new Error('No se pudo obtener la protectora.'));
      })
    );
  }
  createProtectora(protectoraData: FormData): Observable<Protectora> {
    return this.http.post<Protectora>(`${this.apiUrl}/protectora/create`, protectoraData);
  }
}