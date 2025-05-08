import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private serviceId = 'service_s40ir9o'; 
  private templateId = 'template_rlmpglh'; 
  private userId = 'ppQkbqf8dkQdlNgN-'; 

  constructor() {}

  sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<EmailJSResponseStatus> {
    const templateParams = {
      to_email: toEmail,
      message: `Fes clic en el seguent enllaç per reestablir la teva contrasenya: ${resetLink}`,
    };

    return emailjs.send(this.serviceId, this.templateId, templateParams, this.userId);
  }
}