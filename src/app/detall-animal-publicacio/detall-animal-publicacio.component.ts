import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AnimalPerdutService } from '../services/animal-perdut.service';

@Component({
  selector: 'app-detall-animal-publicacio',
  standalone: false,
  templateUrl: './detall-animal-publicacio.component.html',
  styleUrls: ['./detall-animal-publicacio.component.css']
})
export class DetallAnimalPublicacioComponent implements OnChanges {
  @Input() animalId: number | null = null; // Rep l'ID de l'animal
  @Output() back = new EventEmitter<void>(); // Emet un esdeveniment per tornar a la llista
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
          this.animal.imatge = `http://domestius2.vercel.app/uploads/${this.animal.imatge}`;
        }

        this.animal.imatges = [this.animal.imatge];
        this.animal.fraseDivertida = this.generateFunnyPhrase(this.animal);
      },
      error: (err) => {
        console.error('Error en carregar els detalls de l\'animal:', err);
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
    this.back.emit(); // Emet l'esdeveniment per tornar a la llista
  }
   nextImage(): void {
    if (this.animal && this.animal.imatges.length > 0) {
      const previousIndex = this.currentImageIndex;
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.animal.imatges.length;

      if (this.animal.imatges.length === 1) {
        console.log('Això funciona: en fer clic passaria a la següent foto, però només n\'hi ha una.');
        alert('Això funciona: en fer clic passaria a la següent foto, però només n\'hi ha una.');
      } else {
        console.log(`Índex actual (next): ${this.currentImageIndex}, Índex anterior: ${previousIndex}`);
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
        console.log('Això funciona: en fer clic passaria a la foto anterior, però només n\'hi ha una.');
        alert('Això funciona: en fer clic passaria a la foto anterior, però només n\'hi ha una.');
      } else {
        console.log(`Índex actual (prev): ${this.currentImageIndex}, Índex anterior: ${previousIndex}`);
      }
    }
  }

  toggleContactForm(): void {
    this.showContactForm = !this.showContactForm;
  }
 /*   onSubmit(): void {
    console.log('Formulari enviat:', this.contactForm);
    alert('Gràcies per interessar-te, en breu ens posarem en contacte amb tu.');
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
    this.showContactForm = false;
  } */
    onFormSubmit(event: Event): void {
      event.preventDefault(); // Evita el comportament predeterminat per depuració
      const form = event.target as HTMLFormElement;
    
      // Captura les dades del formulari
      const formData = new FormData(form);
      const data: { [key: string]: string } = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
    
      console.log('Formulari enviat amb les següents dades:', data);
    
      // Permet que el formulari s'enviï després de la depuració
      form.submit();
    }
}