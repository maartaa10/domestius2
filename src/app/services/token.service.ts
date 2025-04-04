import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  handleToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  revokeToken(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    if (this.getToken())
      return true;

    return false;
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (token) {
      try {
        // Si el token es JWT, podemos decodificar la parte de payload
        // Si no, podemos almacenar la información del usuario en localStorage
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        return userInfo;
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
      }
    }
    return null;
  }
}