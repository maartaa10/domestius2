import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-detall-animal-publicacio',
  standalone: false,
  templateUrl: './detall-animal-publicacio.component.html',
  styleUrls: ['./detall-animal-publicacio.component.css']
})
export class DetallAnimalPublicacioComponent implements OnInit {
  animal: any;
  currentImageIndex: number = 0;
  showContactForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animalPerdutService: AnimalPerdutService
  ) {}

  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  onSubmit(): void {
    console.log('Formulario enviado:', this.contactForm);
    alert('Gracias por interesarte, en breves nos comunicaremos contigo.');
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
    this.showContactForm = false;
  }

  ngOnInit(): void {
    const animalId = this.route.snapshot.params['id'];
    this.loadAnimalDetails(animalId);
  }

  loadAnimalDetails(animalId: number): void {
    this.animalPerdutService.getAnimalById(animalId).subscribe({
      next: (animal) => {
        this.animal = animal;
        console.log('Valor de animal.imatge:', this.animal.imatge);

        if (this.animal.imatge && !this.animal.imatge.startsWith('http')) {
          this.animal.imatge = `http://127.0.0.1:8000/uploads/${this.animal.imatge}`;
        }

        this.animal.imatges = [this.animal.imatge];
        this.animal.fraseDivertida = this.generateFunnyPhrase(this.animal);

        console.log('Array de imágenes:', this.animal.imatges);
        console.log('Frase divertida:', this.animal.fraseDivertida);
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
}