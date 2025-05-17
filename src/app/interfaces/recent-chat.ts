export interface RecentChat {
    id: string; // ID del usuario o canal
    name: string; // Nombre del usuario o canal
    avatar: string; // URL del avatar
    unreadCount: number; // Número de mensajes no leídos
    pinned: boolean; // Si el chat está anclado
    nom?: string; // Nombre del usuario (opcional, si es diferente de `name`)
    online?: boolean; // Estado en línea del usuario (opcional)
  }