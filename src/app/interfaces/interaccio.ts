import { Usuari } from "./usuari";

export interface Interaccio {
    id?: number;
    accio: string;
    data: Date | string;
    detalls: string;
    publicacio_id: number;
    usuari_id: number;
    tipus_interaccio_id: number;
}