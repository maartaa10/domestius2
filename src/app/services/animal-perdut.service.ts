import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Animal } from '../interfaces/animal';

@Injectable({
  providedIn: 'root'
})
export class AnimalPerdutService {

  constructor(private http: HttpClient) {}
  private apiUrl = 'http://127.0.0.1:8000/api/animales'; 

  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl);
  }
  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${id}`);
  }
}
