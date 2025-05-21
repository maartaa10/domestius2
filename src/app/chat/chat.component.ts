import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StreamChat } from 'stream-chat';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { ChannelMember } from '../interfaces/channel-member';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('chatHistory') chatHistory!: ElementRef; 

  chatClient: StreamChat;
  channel: any;
  messages: any[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedUser: any = null;
  recentChats: any[] = [];
  randomAvatars: string[] = [
    'https://bootdey.com/img/Content/avatar/avatar1.png',
    'https://bootdey.com/img/Content/avatar/avatar2.png',
    'https://bootdey.com/img/Content/avatar/avatar3.png',
    'https://bootdey.com/img/Content/avatar/avatar4.png',
    'https://bootdey.com/img/Content/avatar/avatar5.png'
  ];
  avatarMap: Map<string, string> = new Map();
  groupedMessages: { date: string; messages: any[] }[] = [];
  constructor(private authService: AuthService, private chatService: ChatService, private tokenService: TokenService, private router: Router,  private cdr: ChangeDetectorRef) {
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
  
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        const userKey = `recentChats_${userData.id}`; 
        const storedChats = localStorage.getItem(userKey);
        this.recentChats = storedChats ? JSON.parse(storedChats) : [];
      },
      error: (err) => {
        console.error('Error en carregar el perfil de l\'usuari:', err);
      }
    });
  }

  async initializeChat(): Promise<void> {
    try {
      console.log('Inicialitzant el client de Stream Chat...');
      const userData = await this.authService.getUserProfile().toPromise();
  
      if (!userData) {
        throw new Error('No s\'ha pogut obtenir el perfil de l\'usuari.');
      }
      console.log('Perfil de l\'usuari obtingut:', userData);
  
      localStorage.setItem('currentUserId', userData.id.toString());
  
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
  
      // Escuchar mensajes nuevos en tiempo real
      this.chatClient.on('message.new', (event) => {
        console.log('Missatge rebut en temps real:', event.message);
        this.handleNewMessage(event.message);
      });
  
      // Sincronizar el estado inicial de los chats
      const filter = { members: { $in: [userData.id.toString()] } };
      const channels = await this.chatClient.queryChannels(filter);
  
      channels.forEach((channel) => {
        Object.values(channel.state.members).forEach((member: any) => {
          const user = member.user;
          if (user) {
            this.recentChats.push({
              id: user.id,
              nom: user.name,
              online: user.online || false,
              unreadCount: 0, // Inicializar contador de mensajes no leídos
            });
          }
        });
      });
  
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error en inicialitzar el xat:', error);
      throw error;
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
  
      if (results && results.length > 0) {
        this.searchResults = results.map((user) => ({
          ...user,
          online: this.chatClient.state.users[user.id]?.online || false,
        }));
        console.log('Resultats de la cerca amb estat actualitzat:', this.searchResults);
      } else {
        console.log('No s\'han trobat resultats per a la cerca.');
        this.searchResults = [];
      }
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
  
      // Reiniciar el contador de mensajes no leídos
      const chatIndex = this.recentChats.findIndex(chat => chat.id === user.id);
      if (chatIndex !== -1) {
        this.recentChats[chatIndex].unreadCount = 0;
      }
  
      const userData = await this.authService.getUserProfile().toPromise();
      const userKey = `recentChats_${userData.id}`;
  
      if (!this.recentChats.some(chat => chat.id === user.id)) {
        this.recentChats.push({
          ...user,
          online: this.chatClient.state.users[user.id]?.online || false,
          unreadCount: 0,
        });
        localStorage.setItem(userKey, JSON.stringify(this.recentChats));
      }
  
      localStorage.setItem('lastUser', JSON.stringify(user));
      console.log('Usuari desat a localStorage:', user);
  
      await this.chatClient.upsertUser({
        id: user.id.toString(),
        name: user.nom || 'Usuari desconegut',
      });
      console.log('Usuari sincronitzat amb Stream Chat.');
  
      // Asegurarse de que no haya IDs duplicados
      const userIds = Array.from(new Set([this.chatClient.userID?.toString(), user.id.toString()])).sort();
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
        this.groupMessagesByDate(this.messages); 
        this.cdr.detectChanges();
        this.scrollToBottom(); 
      });
  
      const response = await this.channel.query({ messages: { limit: 20 } });
      console.log('Missatges carregats del canal:', response.messages);
      this.messages = response?.messages ?? [];
      this.groupMessagesByDate(this.messages); 
      this.scrollToBottom(); 
    } catch (error) {
      console.error('Error en iniciar el xat:', error);
    }
    
  }
  private handleNewMessage(message: any): void {
    const senderId = message.user?.id;
  
    if (!senderId) {
      console.warn('Missatge rebut sense usuari vàlid:', message);
      return;
    }
  
    // Buscar el usuario en la lista de chats recientes
    const chatIndex = this.recentChats.findIndex(chat => chat.id === senderId);
  
    if (chatIndex !== -1) {
      // Si el usuario ya está en la lista, moverlo al primer lugar y aumentar el contador
      const chat = this.recentChats[chatIndex];
      chat.unreadCount = (chat.unreadCount || 0) + 1;
      this.recentChats.splice(chatIndex, 1); // Eliminar de la posición actual
      this.recentChats.unshift(chat); // Agregar al principio
    } else {
      // Si el usuario no está en la lista, agregarlo
      this.recentChats.unshift({
        id: senderId,
        nom: message.user?.name || 'Usuari desconegut',
        online: this.chatClient.state.users[senderId]?.online || false,
        unreadCount: 1, // Primer mensaje no leído
      });
    }
  
    this.cdr.detectChanges();
  }
  private scrollToBottom(): void {
    try {
      this.chatHistory.nativeElement.scrollTop = this.chatHistory.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll hacia abajo:', err);
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
        return `http://domestius2.vercel.app/${user.imatge}`;
      }
      return user.imatge;
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const index = userId % this.randomAvatars.length;
    return this.randomAvatars[index];
  }

  getUltimaConexio(): string {
    if (!this.selectedUser || !this.channel) {
      return 'Desconeguda';
    }
  
    const members = Object.values(this.channel.state.members)
      .map((member) => member as ChannelMember)
      .filter((member) => member.user_id);
  
    const otherMember = members.find(
      (member) => member.user_id !== this.chatClient.userID
    );
  
    if (otherMember && otherMember.user?.last_active) {
      return new Date(otherMember.user.last_active).toLocaleString();
    }
  
    return 'No hi ha activitat recent';
  }
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sessió tancada al servidor');
        localStorage.removeItem('lastUser'); 
        this.tokenService.revokeToken();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en tancar sessió:', err);
        localStorage.removeItem('lastUser'); 
        this.tokenService.revokeToken();
        this.router.navigate(['/login']);
      }
    });
  }
  private groupMessagesByDate(messages: any[]): void {
    const grouped = messages.reduce((acc, message) => {
      const messageDate = new Date(message.created_at).toLocaleDateString();
      if (!acc[messageDate]) {
        acc[messageDate] = [];
      }
      acc[messageDate].push(message);
      return acc;
    }, {} as { [key: string]: any[] });
  
    this.groupedMessages = Object.keys(grouped).map((date) => ({
      date: this.formatDate(date),
      messages: grouped[date],
    }));
  }
  private formatDate(date: string): string {
    const today = new Date().toLocaleDateString('ca-ES');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('ca-ES');
  
    if (date === today) {
      return 'Avui';
    } else if (date === yesterday) {
      return 'Ahir';
    } else {
      const [day, month, year] = date.split('/').map(Number);
      const parsedDate = new Date(year, month - 1, day); 
  
      if (!isNaN(parsedDate.getTime())) {
        return new Intl.DateTimeFormat('ca-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(parsedDate);
      } else {
        console.error('Invalid date:', date);
        return 'Data desconeguda';
      }
    }
  }
  clearChat(): void {
    if (confirm('Estàs segur que vols eliminar tots els missatges del xat?')) {
      this.messages = [];
      this.groupedMessages = [];
      console.log('Missatges eliminats.');
      this.cdr.detectChanges(); 
    }
  }
}