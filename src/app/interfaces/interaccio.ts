import { Usuari } from "./usuari";

export interface Interaccio {
    accio: string;
    data: Date;
    detalls: string;
    usuari?: Usuari; 
}
