import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Publicacio } from '../interfaces/publicacio';

@Injectable({
  providedIn: 'root'
})
export class PublicacioService {

  private apiUrl = 'https://apidomestius-production.up.railway.app/api';

  constructor(private http: HttpClient) {}
  getPublicacions(): Observable<Publicacio[]> {
    return this.http.get<Publicacio[]>(`${this.apiUrl}/publicacions`);
  }

  getPublicacionesByUsuario(userId: number): Observable<Publicacio[]> {
    return this.http.get<Publicacio[]>(`${this.apiUrl}/usuari/${userId}/publicacions`);
  }

 
  getPublicacioById(id: number): Observable<Publicacio> {
    return this.http.get<Publicacio>(`${this.apiUrl}/publicacio/${id}`).pipe(
      tap((response) => console.log('Publicacio response:', response))
    );
  }

  addPublicacio(publicacio: any): Observable<Publicacio> {
    return this.http.post<Publicacio>(`${this.apiUrl}/publicacio/create`, publicacio);
  }

 
  updatePublicacio(id: number, publicacio: any): Observable<any> {
    return this.http.put<Publicacio>(`${this.apiUrl}/publicacio/update/${id}`, publicacio);
  }
  deletePublicacio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/publicacio/delete/${id}`);
  }
  getPublicacioByAnimalId(animalId: number): Observable<Publicacio | null> {
    return this.http.get<Publicacio[]>(`${this.apiUrl}/publicacio`).pipe(
      map((publicacions) => publicacions.find((publicacio) => publicacio.animal_id === animalId) || null),
      catchError((err) => {
        console.error('Error al buscar la publicación por animal_id:', err);
        return of(null); // Devuelve null si ocurre un error
      })
    );
  }
}
