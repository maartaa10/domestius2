import { Usuari } from './usuari';
export interface Protectora {
     id: number;
   /*  nombre: string; */
   
    direccion: string;
    telefono: string;
    /* verificada: boolean; */
    imatge: string;
    horario_apertura: string;
    horario_cierre: string;
    usuari?: Usuari;
}
