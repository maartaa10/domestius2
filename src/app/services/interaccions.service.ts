import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Interaccio } from '../interfaces/interaccio';

@Injectable({
  providedIn: 'root'
})
export class InteraccionsService {

  private apiUrl = 'http://domestius2.vercel.app/api';

  constructor(private http: HttpClient) {}

  // Obtener todas las interacciones
  getInteraccions(): Observable<Interaccio[]> {
    return this.http.get<Interaccio[]>(`${this.apiUrl}/interaccions`);
  }

  // Obtener una interacción por ID
  getInteraccioById(id: number): Observable<Interaccio> {
    return this.http.get<Interaccio>(`${this.apiUrl}/interaccio/${id}`);
  }

  // Obtener interacciones por publicación
  getInteraccionsByPublicacio(publicacioId: number): Observable<Interaccio[]> {
    return this.http.get<Interaccio[]>(`${this.apiUrl}/publicacio/${publicacioId}/interaccions`);
  }

  // Crear una nueva interacción
  createInteraccio(interaccio: Interaccio): Observable<Interaccio> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log('Enviando interacción:', interaccio); // Para debugging
    
    return this.http.post<Interaccio>(`${this.apiUrl}/interaccio/create`, interaccio, { headers });
  }

  // Actualizar una interacción existente
  updateInteraccio(id: number, interaccio: Interaccio): Observable<Interaccio> {
    return this.http.put<Interaccio>(`${this.apiUrl}/interaccio/${id}`, interaccio);
  }

  // Eliminar una interacción
  deleteInteraccio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/interaccio/${id}`);
  }

  // Obtener los tipos de interacciones
  getTipusInteraccions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tipus-interaccions`);
  }
}
