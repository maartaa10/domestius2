import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-detall-animal-publicacio',
  standalone: false,
  templateUrl: './detall-animal-publicacio.component.html',
  styleUrls: ['./detall-animal-publicacio.component.css']
})
export class DetallAnimalPublicacioComponent implements OnChanges {
  @Input() animalId: number | null = null; // Recibe el ID del animal
  @Output() back = new EventEmitter<void>(); // Emite un evento para volver a la lista
  animal: any;
  currentImageIndex: number = 0;
  showContactForm: boolean = false;
  contactForm = {
    name: '',
    email: '',
    message: ''
  };
  constructor(private animalPerdutService: AnimalPerdutService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animalId'] && this.animalId !== null) {
      this.loadAnimalDetails(this.animalId);
    }
  }

  loadAnimalDetails(animalId: number): void {
    this.animalPerdutService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;

        if (this.animal.imatge && !this.animal.imatge.startsWith('http')) {
          this.animal.imatge = `http://127.0.0.1:8000/uploads/${this.animal.imatge}`;
        }

        this.animal.imatges = [this.animal.imatge];
        this.animal.fraseDivertida = this.generateFunnyPhrase(this.animal);
      },
      error: (err) => {
        console.error('Error al cargar los detalles del animal:', err);
      }
    });
  }

  generateFunnyPhrase(animal: any): string {
    const phrases = [
      `${animal.nom} és el rei del sofà.`,
      `${animal.nom} mai diu que no a una bona passejada.`,
      `${animal.nom} és més ràpid que el Wi-Fi.`,
      `${animal.nom} té més carisma que un influencer.`,
      `${animal.nom} és el millor amic que podries tenir.`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  goBack(): void {
    this.back.emit(); // Emite el evento para volver a la lista
  }
   nextImage(): void {
    if (this.animal && this.animal.imatges.length > 0) {
      const previousIndex = this.currentImageIndex;
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.animal.imatges.length;

      if (this.animal.imatges.length === 1) {
        console.log('Esto funciona: al hacer clic pasaría a la siguiente foto, pero solo hay una.');
        alert('Esto funciona: al hacer clic pasaría a la siguiente foto, pero solo hay una.');
      } else {
        console.log(`Índice actual (next): ${this.currentImageIndex}, Índice anterior: ${previousIndex}`);
      }
    }
  }

  prevImage(): void {
    if (this.animal && this.animal.imatges.length > 0) {
      const previousIndex = this.currentImageIndex;
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.animal.imatges.length) %
        this.animal.imatges.length;

      if (this.animal.imatges.length === 1) {
        console.log('Esto funciona: al hacer clic pasaría a la foto anterior, pero solo hay una.');
        alert('Esto funciona: al hacer clic pasaría a la foto anterior, pero solo hay una.');
      } else {
        console.log(`Índice actual (prev): ${this.currentImageIndex}, Índice anterior: ${previousIndex}`);
      }
    }
  }

  toggleContactForm(): void {
    this.showContactForm = !this.showContactForm;
  }
 /*   onSubmit(): void {
    console.log('Formulario enviado:', this.contactForm);
    alert('Gracias por interesarte, en breves nos comunicaremos contigo.');
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
    this.showContactForm = false;
  } */
    onFormSubmit(event: Event): void {
      event.preventDefault(); // Evita el comportamiento predeterminado para depuración
      const form = event.target as HTMLFormElement;
    
      // Captura los datos del formulario
      const formData = new FormData(form);
      const data: { [key: string]: string } = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
    
      console.log('Formulario enviado con los siguientes datos:', data);
    
      // Permite que el formulario se envíe después de la depuración
      form.submit();
    }
}