import { Component, OnInit } from '@angular/core';
import { StreamChat } from 'stream-chat';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  chatClient: StreamChat;
  channel: any;
  messages: any[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedUser: any = null;

  randomAvatars: string[] = [
    'https://bootdey.com/img/Content/avatar/avatar1.png',
    'https://bootdey.com/img/Content/avatar/avatar2.png',
    'https://bootdey.com/img/Content/avatar/avatar3.png',
    'https://bootdey.com/img/Content/avatar/avatar4.png',
    'https://bootdey.com/img/Content/avatar/avatar5.png'
  ];
  avatarMap: Map<string, string> = new Map();

  constructor(private authService: AuthService, private chatService: ChatService) {
    this.chatClient = new StreamChat('wc2s9br829f9');
  }

  ngOnInit(): void {
    console.log('Inicializando el componente de chat...');
    this.initializeChat();

    const lastUser = localStorage.getItem('lastUser');
    if (lastUser) {
      this.selectedUser = JSON.parse(lastUser);
      this.searchResults = [this.selectedUser];
      console.log('Último usuario cargado desde localStorage:', this.selectedUser);
    }
  }

  async initializeChat(): Promise<void> {
    try {
      console.log('Inicializando el cliente de Stream Chat...');
      const userData = await this.authService.getUserProfile().toPromise();

      if (!userData) {
        throw new Error('No se pudo obtener el perfil del usuario.');
      }
      console.log('Perfil del usuario obtenido:', userData);

      const tokenResponse = await this.chatService.getUserToken(userData.id).toPromise();

      if (!tokenResponse || !tokenResponse.token) {
        throw new Error('No se pudo obtener el token del usuario.');
      }
      console.log('Token obtenido:', tokenResponse.token);

      await this.chatClient.connectUser(
        {
          id: userData.id.toString(),
          name: userData.nom,
        },
        tokenResponse.token
      );
      console.log('Usuario conectado al cliente de Stream Chat.');

      this.chatClient.on('connection.changed', (event) => {
        console.log('Estado de la conexión:', event.online ? 'Conectado' : 'Desconectado');
      });

      this.chatClient.on('connection.error', (event) => {
        console.error('Error en la conexión de WebSocket:', event);
      });
    } catch (error) {
      console.error('Error al inicializar el chat:', error);
    }
  }

  async searchUsers(): Promise<void> {
    if (this.searchQuery.trim() === '') {
      const lastUser = localStorage.getItem('lastUser');
      this.searchResults = lastUser ? [JSON.parse(lastUser)] : [];
      console.log('Búsqueda vacía. Último usuario cargado:', this.searchResults);
      return;
    }

    try {
      console.log('Buscando usuarios con el término:', this.searchQuery);
      const results = await this.chatService.searchUsers(this.searchQuery).toPromise();
      this.searchResults = results ?? [];
      console.log('Resultados de búsqueda:', this.searchResults);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      alert('No se pudo realizar la búsqueda. Inténtalo de nuevo.');
      this.searchResults = [];
    }
  }

  async startChat(user: any): Promise<void> {
    try {
      console.log('Iniciando chat con el usuario:', user);
      this.selectedUser = user;
  
      localStorage.setItem('lastUser', JSON.stringify(user));
      console.log('Usuario guardado en localStorage:', user);
  
      await this.chatClient.upsertUser({
        id: user.id.toString(),
        name: user.nom || 'Usuario desconocido',
      });
      console.log('Usuario sincronizado con Stream Chat.');
  
      const userIds = [this.chatClient.userID?.toString(), user.id.toString()].sort();
      const channelId = `chat-${userIds.join('-')}`;
  
      this.channel = this.chatClient.channel('messaging', channelId, {
        members: userIds,
      });
      await this.channel.watch();
      console.log('Canal inicializado:', this.channel.id);
  
      console.log('Miembros del canal:', this.channel.state.members);
  
      this.channel.on('message.new', (event: any) => {
        console.log('Mensaje recibido en tiempo real:', event.message);
        this.messages.push(event.message);
      });
  
      this.channel.on('member.updated', (event: any) => {
        console.log('Estado de un miembro actualizado:', event.member);
      });
  
      this.channel.on('member.added', (event: any) => {
        console.log('Nuevo miembro añadido al canal:', event.member);
      });
  
      const response = await this.channel.query({ messages: { limit: 20 } });
      console.log('Mensajes cargados del canal:', response.messages);
      this.messages = response?.messages ?? [];
    } catch (error) {
      console.error('Error al iniciar el chat:', error);
    }
  }
  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() === '') return;

    try {
      console.log('Enviando mensaje:', this.newMessage);
      const response = await this.channel.sendMessage({ text: this.newMessage });
      console.log('Mensaje enviado:', response);

      console.log('Estado actual del canal después de enviar el mensaje:', this.channel.state.messages);

      this.newMessage = '';
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  }

  getRandomAvatar(user: any): string {
    if (!user) {
      return this.randomAvatars[0];
    }

    if (user.imatge) {
      if (!user.imatge.startsWith('http')) {
        return `http://127.0.0.1:8000/${user.imatge}`;
      }
      return user.imatge;
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const index = userId % this.randomAvatars.length;
    return this.randomAvatars[index];
  }

  getUltimaConexio(): string {
    if (!this.selectedUser) {
      return 'Desconocida';
    }

    if (this.messages && this.messages.length > 0) {
      const ultimoMensaje = this.messages[this.messages.length - 1];
      return new Date(ultimoMensaje.created_at).toLocaleString();
    }

    return 'No hay actividad reciente';
  }
}