import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: false,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FAQComponent {
  
  /**
   * Maneja la apertura/cierre de los acordeones
   * @param event Evento del click
   */
  toggleAccordion(event: MouseEvent): void {
    const header = event.currentTarget as HTMLElement;
    const item = header.parentElement;
    
    if (item) {
      // Si el ítem ya está activo, lo cerramos
      if (item.classList.contains('active')) {
        item.classList.remove('active');
      } else {
        // Si queremos que solo un ítem se abra a la vez, descomentar estas líneas:
        // const activeItems = document.querySelectorAll('.accordion-item.active');
        // activeItems.forEach(activeItem => activeItem.classList.remove('active'));
        
        // Activar el ítem actual
        item.classList.add('active');
      }
    }
  }
}