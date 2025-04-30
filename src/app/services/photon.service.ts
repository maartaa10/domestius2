import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotonService {
  private apiUrl = 'https://photon.komoot.io/api/';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&limit=5`;
    return this.http.get(url);
  }
}