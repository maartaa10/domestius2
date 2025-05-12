import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://127.0.0.1:8000/api/chat'; 

  constructor(private http: HttpClient) {}

  getUserToken(userId: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/token`, { user_id: userId });
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params: { query } }).pipe(
      catchError(err => {
        console.error('Error al buscar usuarios en el backend:', err);
        return of([]); 
      })
    );
  }
  upsertUser(user: { id: string; name: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/upsert-user`, user).pipe(
      catchError(err => {
        console.error('Error al sincronizar el usuario en el backend:', err);
        throw err;
      })
    );
  }
}