export interface Usuari {
    id: number;
    nom: string;
    email: string;
    password: string;
    password_confirmation?: string;
}
