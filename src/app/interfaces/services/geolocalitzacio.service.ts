import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Geolocalitzacio } from '../../interfaces/geolocalitzacio';

@Injectable({
  providedIn: 'root'
})
export class GeolocalitzacioService {
  private apiUrl = 'https://apidomestius-production.up.railway.app/api/geolocalitzacions'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) {}

  getGeolocalitzacions(): Observable<Geolocalitzacio[]> {
    return this.http.get<Geolocalitzacio[]>(this.apiUrl);
  }
}