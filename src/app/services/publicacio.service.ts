import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Publicacio } from '../interfaces/publicacio';

@Injectable({
  providedIn: 'root'
})
export class PublicacioService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}
  getPublicacions(): Observable<Publicacio[]> {
    return this.http.get<Publicacio[]>(`${this.apiUrl}/publicacions`);
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
}
