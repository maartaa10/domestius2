import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errors: any;
  /* captchaToken: string = '';  */
  showPassword: boolean = false; 

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }
/*   onCaptchaResolved(token: string | null): void {
    if (token) {
      this.captchaToken = token;
      console.log('Token CAPTCHA:', token);
    } else {
      console.warn('No se generó un token de reCAPTCHA.');
      this.captchaToken = ''; 
    }
  } */

  onSubmit(): void {
    this.cleanErrors();
  
    
 /*    if (!this.captchaToken) {
      alert('Completa el captcha antes de enviar');
      return;
    } */
  
    const loginData = {
      ...this.loginForm.value,
    /*   captcha: this.captchaToken */
    };
  
    this.authService.login(loginData).subscribe(
      response => this.handleResponse(response),
      errors => this.handleErrors(errors)
    );
  }

  private handleResponse(response: any): void {
    console.log(response.message);
    this.tokenService.handleToken(response.token);
    this.router.navigateByUrl('/dashboard');
  }

  private handleErrors(errors: any): void {
    this.errors = errors.error.errors;
    console.log(this.errors);
  }

  private cleanErrors(): void {
    this.errors = null;
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}