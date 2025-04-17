export interface UsuariCreate {
    nom: string;
    email: string;
    password: string;
    password_confirmation?: string;
}