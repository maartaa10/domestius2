import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private serviceId = 'service_s40ir9o'; // Reemplaza con tu Service ID
  private templateId = 'template_rlmpglh'; // Reemplaza con tu Template ID
  private userId = 'ppQkbqf8dkQdlNgN-'; // Reemplaza con tu User ID

  constructor() {}

  sendPasswordResetEmail(toEmail: string, token: string): Promise<EmailJSResponseStatus> {
    // Generar el enlace de recuperación que apunta al componente `RegenerarContrasenyaComponent`
    const resetLink = `https://domestius2.vercel.app/reset-password?email=${toEmail}&token=${token}`;

    // Parámetros para la plantilla de EmailJS
    const templateParams = {
      to_email: toEmail,
      link: resetLink, // Aquí pasamos el enlace al marcador {{link}} en la plantilla
    };

    // Enviar el correo con EmailJS
    return emailjs.send(this.serviceId, this.templateId, templateParams, this.userId);
  }
}