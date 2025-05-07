import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  // Obtener comarcas o ciudades
  getComarcasOrCities(query: string): Observable<any[]> {
    const encodedQuery = encodeURIComponent(query); // Codificar el valor de la consulta
    const url = `${this.baseUrl}?q=${encodedQuery}&format=json`; // Simplificar la URL
    return this.http.get<any[]>(url);
  }
}