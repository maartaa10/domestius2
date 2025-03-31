import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}