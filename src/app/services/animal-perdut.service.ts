import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Animal } from '../interfaces/animal';

@Injectable({
  providedIn: 'root'
})
export class AnimalPerdutService {

  constructor(private http: HttpClient) {}
  private apiUrl = 'http://127.0.0.1:8000/api'; 

 
  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/animales`);
  }


  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/animal/get/${id}`);
  }


  addAnimal(animalData: FormData): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/animal/create`, animalData);
  }


  updateAnimal(id: number, data: FormData): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/animal/${id}`, data);
  }

 
  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/animal/delete/${id}`);
  }

 
  getAnimalImatge(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/animal/imatge/${id}`);
  }
}