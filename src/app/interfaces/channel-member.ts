export interface ChannelMember {
    user_id: string; // ID del usuario
    user?: {
      id?: string; // ID del usuario
      name?: string; // Nombre del usuario
      last_active?: string; // Última actividad del usuario
      [key: string]: any; // Otras propiedades dinámicas
    };
    [key: string]: any; // Otras propiedades dinámicas
  }