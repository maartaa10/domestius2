import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  usuario = {
    nombre: 'Juan Pérez',
    correo: 'juan.perez@example.com'
  };

  constructor(private router: Router) {}

  cerrarSesion(): void {
    // Aquí puedes agregar la lógica para cerrar sesión (por ejemplo, eliminar tokens)
    console.log('Sesión cerrada');
    this.router.navigate(['/']); // Redirige al inicio o página de login
  }
}

