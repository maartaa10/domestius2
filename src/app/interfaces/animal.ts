import { Geolocalitzacio } from "./geolocalitzacio";
import { Protectora } from "./protectora";

export interface Animal {
    id: number;
    nom: string;
    edat: number | null;
especie: string;
raça: string | null;
descripcio: string | null;
estat : string;
imatge: string | null;
protectora_id: number;
geolocalitzacio_id: number | null;
  geolocalitzacio?: Geolocalitzacio;
}
