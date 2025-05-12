import { Component, OnInit } from '@angular/core';
import { StreamChat } from 'stream-chat';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { Protectora } from '../interfaces/protectora';
import { ProtectoraService } from '../services/protectora.service';

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

  constructor(private authService: AuthService, private chatService: ChatService, private protectoraService: ProtectoraService) {
    this.chatClient = new StreamChat('wc2s9br829f9');
  }

  ngOnInit(): void {
    this.initializeChat();
  
    const lastUser = localStorage.getItem('lastUser');
    if (lastUser) {
      this.selectedUser = JSON.parse(lastUser);
      this.searchResults = [this.selectedUser];
    }
  }

  async initializeChat(): Promise<void> {
    try {
      const userData = await this.authService.getUserProfile().toPromise();
  
      if (!userData) {
        throw new Error('No s\'ha pogut obtenir el perfil de l\'usuari.');
      }
  
      const tokenResponse = await this.chatService.getUserToken(userData.id).toPromise();
  
      if (!tokenResponse || !tokenResponse.token) {
        throw new Error('No s\'ha pogut obtenir el token de l\'usuari.');
      }
  
      await this.chatClient.connectUser(
        {
          id: userData.id.toString(),
          name: userData.nom,
        },
        tokenResponse.token
      );
    } catch (error) {
      console.error('Error en inicialitzar el xat:', error);
    }
  }

  async searchUsers(): Promise<void> {
    if (this.searchQuery.trim() === '') {
      const lastUser = localStorage.getItem('lastUser');
      this.searchResults = lastUser ? [JSON.parse(lastUser)] : [];
      return;
    }
  
    try {
      const results = await this.chatService.searchUsers(this.searchQuery).toPromise();
      this.searchResults = results ?? [];
    } catch (error) {
      console.error('Error en cercar usuaris:', error);
      alert('No s\'ha pogut realitzar la cerca. Torna-ho a intentar.');
      this.searchResults = [];
    }
  }
  async startChat(user: any): Promise<void> {
    try {
      this.selectedUser = user;
      console.log('Usuario seleccionado:', this.selectedUser);
  
    
      console.log('Llamando a getProtectoraByUsuario con ID:', user.id);
      const protectora = await this.protectoraService.getProtectoraByUsuario(user.id).toPromise();
      console.log('Respuesta de getProtectoraByUsuario:', protectora);
  
      if (!protectora) {
        console.warn('No se encontró una protectora asociada al usuario.');
      }
  
     
      localStorage.setItem('lastUser', JSON.stringify(user));
  
      await this.chatClient.upsertUser({
        id: user.id.toString(),
        name: user.nom || 'Usuari desconegut',
      });
  
      this.channel = this.chatClient.channel('messaging', {
        members: [this.chatClient.userID?.toString(), user.id.toString()],
      });
      await this.channel.watch();
  
      this.channel.on('message.new', (event: any) => {
        this.messages.push(event.message);
      });
  
      const response = await this.channel.query({ messages: { limit: 20 } });
      this.messages = response?.messages ?? [];
  
      const avatarUrl = this.getRandomAvatar(user, protectora);
      console.log('Avatar URL:', avatarUrl);
    } catch (error) {
      console.error('Error al iniciar el chat:', error);
    }
  }
  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() === '') return;

    try {
      await this.channel.sendMessage({ text: this.newMessage });
      this.newMessage = '';
    } catch (error) {
      console.error('Error en enviar el missatge:', error);
    }
  }
  getRandomAvatar(user: any, protectora?: Protectora): string {
    if (!user) {
      return this.randomAvatars[0];
    }
  
    if (protectora && protectora.imatge) {
      if (!protectora.imatge.startsWith('http')) {
        return `http://127.0.0.1:8000/${protectora.imatge}`;
      }
      return protectora.imatge;
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
      return 'Desconeguda';
    }
  
    if (this.messages && this.messages.length > 0) {
      const ultimoMensaje = this.messages[this.messages.length - 1];
      return new Date(ultimoMensaje.created_at).toLocaleString();
    }
  
    return 'No hi ha activitat recent';
  }
}