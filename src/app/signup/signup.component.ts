import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  registerForm: FormGroup;
  errors: any;
  captchaToken: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
      password_confirmation: ['']
    });
  }

  onCaptchaResolved(token: string | null): void {
    if (token) {
      this.captchaToken = token;
      console.log('Token CAPTCHA:', token);
    } else {
      console.warn('No se generó un token de reCAPTCHA.');
      this.captchaToken = '';
    }
  }

  onSubmit(): void {
    this.cleanErrors();
  
    if (!this.captchaToken) {
      alert('Completa el captcha antes de enviar');
      return;
    }
  
    const name = this.registerForm.get('name')?.value ?? '';
    const email = this.registerForm.get('email')?.value ?? '';
    const password = this.registerForm.get('password')?.value ?? '';
    const password_confirmation = this.registerForm.get('password_confirmation')?.value ?? '';
  
    if (!name || !email || !password || !password_confirmation) {
      alert('Todos los campos son obligatorios');
      return;
    }
  
    const registerData = {
      name,
      email,
      password,
      password_confirmation,
      captcha: this.captchaToken
    };
  
    this.authService.register(registerData).subscribe(
      response => this.handleResponse(response),
      errors => this.handleErrors(errors)
    );
  }

  private handleResponse(response: any): void {
    console.log(response.message);
    this.router.navigateByUrl('/login');
  }

  private handleErrors(errors: any): void {
    this.errors = errors.error.errors;
    console.log(this.errors);
  }

  private cleanErrors(): void {
    this.errors = null;
  }
}