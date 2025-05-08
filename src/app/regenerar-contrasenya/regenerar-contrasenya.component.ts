import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-regenerar-contrasenya',
  standalone: false,
  templateUrl: './regenerar-contrasenya.component.html',
  styleUrl: './regenerar-contrasenya.component.css'
})
export class RegenerarContrasenyaComponent {
  resetForm: FormGroup;
  email: string = ''; 
  token: string = ''; 
  message: string = ''; 

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
   
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];
      if (!this.email || !this.token) {
        this.message = 'Enllaç invàlid o caducat.';
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.message = 'Si us plau, completa tots els camps correctament.';
      return;
    }

    const passwords = this.resetForm.value;

    
    this.authService.resetPassword(this.email, this.token, passwords).subscribe({
      next: () => {
        this.message = 'Contrasenya restablerta amb èxit. Ara pots iniciar sessió.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error en restablir la contrasenya:', err);
        this.message = 'Error en restablir la contrasenya. Torna-ho a intentar.';
      }
    });
  }
}