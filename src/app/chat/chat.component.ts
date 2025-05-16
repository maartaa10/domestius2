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
    console.log('Inicialitzant el component de xat...');
    this.initializeChat();

    const lastUser = localStorage.getItem('lastUser');
    if (lastUser) {
      this.selectedUser = JSON.parse(lastUser);
      this.searchResults = [this.selectedUser];
      console.log('Últim usuari carregat des de localStorage:', this.selectedUser);
    }
  }

  async initializeChat(): Promise<void> {
    try {
      console.log('Inicialitzant el client de Stream Chat...');
      const userData = await this.authService.getUserProfile().toPromise();

      if (!userData) {
        throw new Error('No s\'ha pogut obtenir el perfil de l\'usuari.');
      }
      console.log('Perfil de l\'usuari obtingut:', userData);

      const tokenResponse = await this.chatService.getUserToken(userData.id).toPromise();

      if (!tokenResponse || !tokenResponse.token) {
        throw new Error('No s\'ha pogut obtenir el token de l\'usuari.');
      }
      console.log('Token obtingut:', tokenResponse.token);

      await this.chatClient.connectUser(
        {
          id: userData.id.toString(),
          name: userData.nom,
        },
        tokenResponse.token
      );
      console.log('Usuari connectat al client de Stream Chat.');

      this.chatClient.on('connection.changed', (event) => {
        console.log('Estat de la connexió:', event.online ? 'Connectat' : 'Desconnectat');
      });

      this.chatClient.on('connection.error', (event) => {
        console.error('Error en la connexió de WebSocket:', event);
      });
    } catch (error) {
      console.error('Error en inicialitzar el xat:', error);
    }
  }

  async searchUsers(): Promise<void> {
    if (this.searchQuery.trim() === '') {
      const lastUser = localStorage.getItem('lastUser');
      this.searchResults = lastUser ? [JSON.parse(lastUser)] : [];
      console.log('Cerca buida. Últim usuari carregat:', this.searchResults);
      return;
    }

    try {
      console.log('Cercant usuaris amb el terme:', this.searchQuery);
      const results = await this.chatService.searchUsers(this.searchQuery).toPromise();
      this.searchResults = results ?? [];
      console.log('Resultats de la cerca:', this.searchResults);
    } catch (error) {
      console.error('Error en cercar usuaris:', error);
      alert('No s\'ha pogut realitzar la cerca. Torna-ho a intentar.');
      this.searchResults = [];
    }
  }

  async startChat(user: any): Promise<void> {
    try {
      console.log('Iniciant xat amb l\'usuari:', user);
      this.selectedUser = user;
  
      localStorage.setItem('lastUser', JSON.stringify(user));
      console.log('Usuari desat a localStorage:', user);
  
      await this.chatClient.upsertUser({
        id: user.id.toString(),
        name: user.nom || 'Usuari desconegut',
      });
      console.log('Usuari sincronitzat amb Stream Chat.');
  
      const userIds = [this.chatClient.userID?.toString(), user.id.toString()].sort();
      const channelId = `chat-${userIds.join('-')}`;
  
      this.channel = this.chatClient.channel('messaging', channelId, {
        members: userIds,
      });
      await this.channel.watch();
      console.log('Canal inicialitzat:', this.channel.id);
  
      console.log('Membres del canal:', this.channel.state.members);
  
      this.channel.on('message.new', (event: any) => {
        console.log('Missatge rebut en temps real:', event.message);
        this.messages.push(event.message);
      });
  
      this.channel.on('member.updated', (event: any) => {
        console.log('Estat d\'un membre actualitzat:', event.member);
      });
  
      this.channel.on('member.added', (event: any) => {
        console.log('Nou membre afegit al canal:', event.member);
      });
  
      const response = await this.channel.query({ messages: { limit: 20 } });
      console.log('Missatges carregats del canal:', response.messages);
      this.messages = response?.messages ?? [];
    } catch (error) {
      console.error('Error en iniciar el xat:', error);
    }
  }

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() === '') return;

    try {
      console.log('Enviant missatge:', this.newMessage);
      const response = await this.channel.sendMessage({ text: this.newMessage });
      console.log('Missatge enviat:', response);

      console.log('Estat actual del canal després d\'enviar el missatge:', this.channel.state.messages);

      this.newMessage = '';
    } catch (error) {
      console.error('Error en enviar el missatge:', error);
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
      return 'Desconeguda';
    }

    if (this.messages && this.messages.length > 0) {
      const ultimoMensaje = this.messages[this.messages.length - 1];
      return new Date(ultimoMensaje.created_at).toLocaleString();
    }

    return 'No hi ha activitat recent';
  }
}