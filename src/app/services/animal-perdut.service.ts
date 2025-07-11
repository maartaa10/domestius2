import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Animal } from '../interfaces/animal';

@Injectable({
  providedIn: 'root'
})
export class AnimalPerdutService {

  constructor(private http: HttpClient) {}
  private apiUrl = 'https://apidomestius-production.up.railway.app/api'; 

 
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

 
  getAnimalImatge(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/animal/imatge/${id}`, { responseType: 'blob' });
  }
  getAnimalesByUsuario(userId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/usuario/${userId}/animales-propios`);
   
  }

  getAnimalesByProtectora(userId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/usuario/${userId}/animales`);
   
  }
}