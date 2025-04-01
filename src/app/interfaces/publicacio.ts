import { Animal } from "./animal";
import { Interaccio } from "./interaccio";
import { Usuari } from "./usuari";

export interface Publicacio {
    id: number;
    tipus: string; 
    data: string; 
    detalls: string; 
    usuari_id: number; 
    animal_id: number; 
    created_at: string; 
    updated_at: string; 
    username: string; 
    usuari?: Usuari; 
    animal?: Animal; 
    interaccions?: Interaccio[]; //accio data detalls
}
