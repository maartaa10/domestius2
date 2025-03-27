import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Protectora } from '../interfaces/protectora';

@Injectable({
  providedIn: 'root'
})
export class ProtectoraService {
  private apiUrl = 'http://127.0.0.1:8000/api/protectoras';

  constructor(private http: HttpClient) {}

  getProtectoras(): Observable<Protectora[]> {
    return this.http.get<Protectora[]>(this.apiUrl);
  }
}