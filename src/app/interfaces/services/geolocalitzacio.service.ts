import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Geolocalitzacio } from '../../interfaces/geolocalitzacio';

@Injectable({
  providedIn: 'root'
})
export class GeolocalitzacioService {
  private apiUrl = 'http://domestius2.vercel.app/api/geolocalitzacions'; 

  constructor(private http: HttpClient) {}

  getGeolocalitzacions(): Observable<Geolocalitzacio[]> {
    return this.http.get<Geolocalitzacio[]>(this.apiUrl);
  }
}