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

 /**
 * Inicialitzem el component de xat i carreguem les dades inicials necessàries.
 */
ngOnInit(): void {
  // Creem un log per indicar que s'està inicialitzant el component de xat. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
  console.log('Inicialitzant el component de xat...');

  // Cridem al mètode per inicialitzar el client de Stream Chat.
  this.initializeChat();

  // Recuperem l'últim usuari seleccionat del localStorage (si existeix).
  const lastUser = localStorage.getItem('lastUser');
  if (lastUser) {
    // Si hi ha un usuari guardat, el parsegem i l'establim com a usuari seleccionat.
    this.selectedUser = JSON.parse(lastUser);

    // Afegim l'usuari seleccionat als resultats de cerca.
    this.searchResults = [this.selectedUser];

    // Creem un log per mostrar l'últim usuari carregat des del localStorage.  PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
    console.log('Últim usuari carregat des de localStorage:', this.selectedUser);
  }

  // Obtenim el perfil de l'usuari actual mitjançant el servei d'autenticació.
  this.authService.getUserProfile().subscribe({
    // Si la crida és ok (hi ha exit):
    next: (userData) => {
      // Creem una clau única per als xats recents de l'usuari.
      const userKey = `recentChats_${userData.id}`; 

      // Recuperem els xats recents guardats al localStorage, si existeixen.
      const storedChats = localStorage.getItem(userKey);

      // Si hi ha xats guardats, els parsegem i els assignem a la llista de xats recents.
      // Si no n'hi ha, inicialitzem la llista com a buida.
      this.recentChats = storedChats ? JSON.parse(storedChats) : [];
    },
    // Si hi ha un error en obtenir el perfil de l'usuari:
    error: (err) => {
      // Creem un log per mostrar l'error en carregar el perfil de l'usuari.  PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
      console.error('Error en carregar el perfil de l\'usuari:', err);
    }
  });
}

  /**
 * Inicialitzem el client de Stream Chat i configurem els esdeveniments de connexió i presència.
 */
async initializeChat(): Promise<void> {
  try {
    // Creem un log per indicar que s'està inicialitzant el client de Stream Chat. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
    console.log('Inicialitzant el client de Stream Chat...');

    // Obtenim el perfil de l'usuari actual mitjançant el servei d'autenticació.
    const userData = await this.authService.getUserProfile().toPromise();

    // Comprovem si s'han obtingut dades de l'usuari.
    if (!userData) {
      throw new Error('No s\'ha pogut obtenir el perfil de l\'usuari.'); // Llança un error si no hi ha dades.
    }
    console.log('Perfil de l\'usuari obtingut:', userData);

    // Guardem l'ID de l'usuari al localStorage per a ús futur.
    localStorage.setItem('currentUserId', userData.id.toString());

    // Obtenim el token d'autenticació per a l'usuari actual.
    const tokenResponse = await this.chatService.getUserToken(userData.id).toPromise();

    // Comprovem si s'ha rebut un token vàlid.
    if (!tokenResponse || !tokenResponse.token) {
      throw new Error('No s\'ha pogut obtenir el token de l\'usuari.'); // Llança un error si no hi ha token.
    }
    console.log('Token obtingut:', tokenResponse.token);

    // Connectem l'usuari al client de Stream Chat utilitzant l'ID i el token.
    await this.chatClient.connectUser(
      {
        id: userData.id.toString(), // ID de l'usuari.
        name: userData.nom, // Nom de l'usuari.
      },
      tokenResponse.token // Token d'autenticació.
    );
    console.log('Usuari connectat al client de Stream Chat.');

    // Filtrar l'usuari loguejat de la llista de xats recents per evitar que aparegui.
    this.recentChats = this.recentChats.filter(chat => chat.id !== this.chatClient.userID);

    // Actualitzem la interfície gràfica.
    this.cdr.detectChanges();

    // Configurem un esdeveniment per detectar canvis en l'estat de la connexió.
    this.chatClient.on('connection.changed', (event) => {
      console.log('Estat de la connexió:', event.online ? 'Connectat' : 'Desconnectat');

      // Si la connexió està activa, actualitzem l'estat dels xats recents.
      if (event.online) {
        this.recentChats = this.recentChats
          .map((user) => {
            // Marquem l'usuari actual com a "online".
            if (user.id === userData.id) {
              console.log(`Usuari ${user.nom} connectat`);
              return { ...user, online: true };
            }
            return user;
          })
          .filter(chat => chat.id !== this.chatClient.userID); // Filtrar l'usuari loguejat.

        // Actualitzem la interfície gràfica.
        this.cdr.detectChanges();
      }
    });

    

    // Configurem un esdeveniment per detectar canvis en la presència dels usuaris.
    this.chatClient.on('user.presence.changed', (event) => {
      console.log('Canvi de presència:', event);

      // Comprovem si l'esdeveniment conté un usuari vàlid.
      if (event.user) {
        console.log(`Usuari afectat: ${event.user.id}, Estat: ${event.user.online ? 'online' : 'offline'}`);

        // Actualitzem l'estat dels usuaris en la llista de xats recents.
        this.recentChats = this.recentChats
          .map((user) => {
            if (user.id === event.user!.id) {
              console.log(`Actualitzant estat de l'usuari ${user.nom} a ${event.user!.online ? 'online' : 'offline'}`);
              return { ...user, online: event.user?.online }; // Actualitzem l'estat 
            }
            return user;
          })
          .filter(chat => chat.id !== this.chatClient.userID); // Filtrar l'usuari loguejat.

        // Actualitzem la interfície gràfica.
        this.cdr.detectChanges();
      } else {
        console.warn('El evento user.presence.changed no contiene un usuario válido:', event);
      }
    });
  } catch (error) {
    // Gestionem els errors que es produeixin durant la inicialització.
    console.error('Error en inicialitzar el xat:', error);
    throw error;
  }
}

/**
 * Cerca usuaris segons el terme introduït i actualitza els resultats de cerca.
 */
async searchUsers(): Promise<void> {
  // Comprovem si el camp de cerca està buit.
  if (this.searchQuery.trim() === '') {
    // Recuperem l'últim usuari seleccionat del localStorage, si existeix.
    const lastUser = localStorage.getItem('lastUser');
    this.searchResults = lastUser ? [JSON.parse(lastUser)] : []; // Afegim l'últim usuari als resultats de cerca.
    console.log('Cerca buida. Últim usuari carregat:', this.searchResults);
    return; // Sortim del mètode si no hi ha cap terme de cerca.
  }

  try {
    // Creem un log per indicar que s'està cercant usuaris amb el terme introduït. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
    console.log('Cercant usuaris amb el terme:', this.searchQuery);

    // Fem una crida al servei de xat per cercar usuaris segons el terme introduït.
    const results = await this.chatService.searchUsers(this.searchQuery).toPromise();

    // Comprovem si s'han trobat resultats.
    if (results && results.length > 0) {
      // Actualitzem els resultats de cerca amb els usuaris trobats.
      this.searchResults = results
        .map((user) => ({
          ...user,
          online: this.chatClient.state.users[user.id]?.online || false, // Afegim l'estat "online" de cada usuari.
        }))
        .filter(user => user.id !== this.chatClient.userID); // Filtrar l'usuari loguejat.
      console.log('Resultats de la cerca amb estat actualitzat:', this.searchResults);
    } else {
      // Si no s'han trobat resultats, buidem els resultats de cerca.
      console.log('No s\'han trobat resultats per a la cerca.');
      this.searchResults = [];
    }
  } catch (error) {
    // Gestionem els errors que es produeixin durant la cerca.
    console.error('Error en cercar usuaris:', error);
    alert('No s\'ha pogut realitzar la cerca. Torna-ho a intentar.');
    this.searchResults = []; // Buidem els resultats de cerca en cas d'error.
  }
}

 /**
 * Inicia un xat amb un usuari seleccionat i configura el canal de missatgeria.
 * @param user L'usuari amb qui es vol iniciar el xat.
 */
async startChat(user: any): Promise<void> {
  try {
    // Creem un log per indicar que s'està iniciant un xat amb l'usuari seleccionat. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
    console.log('Iniciant xat amb l\'usuari:', user);

    // Establim l'usuari seleccionat com a usuari actiu.
    this.selectedUser = user;

    // Obtenim el perfil de l'usuari actual mitjançant el servei d'autenticació.
    const userData = await this.authService.getUserProfile().toPromise();

    // Creem una clau única per als xats recents de l'usuari.
    const userKey = `recentChats_${userData.id}`;

    // Comprovem si l'usuari seleccionat ja està a la llista de xats recents.
    if (!this.recentChats.some(chat => chat.id === user.id)) {
      // Afegim l'usuari seleccionat a la llista de xats recents.
      this.recentChats.push({
        ...user,
        online: this.chatClient.state.users[user.id]?.online || false, // Verifiquem l'estat "online".
      });

      // Filtrar l'usuari loguejat abans de guardar la llista al localStorage.
      const filteredChats = this.recentChats.filter(chat => chat.id !== this.chatClient.userID);
      localStorage.setItem(userKey, JSON.stringify(filteredChats));
    }

    // Desa l'usuari seleccionat al localStorage com a "últim usuari".
    localStorage.setItem('lastUser', JSON.stringify(user));
    console.log('Usuari desat a localStorage:', user);

    // Sincronitzem l'usuari seleccionat amb el client de Stream Chat.
    await this.chatClient.upsertUser({
      id: user.id.toString(),
      name: user.nom || 'Usuari desconegut',
    });
    console.log('Usuari sincronitzat amb Stream Chat.');

    // Creem un identificador únic per al canal basat en els IDs dels usuaris.
    const userIds = [this.chatClient.userID?.toString(), user.id.toString()].sort();
    const channelId = `chat-${userIds.join('-')}`;

    // Inicialitzem el canal de missatgeria amb els membres corresponents.
    this.channel = this.chatClient.channel('messaging', channelId, {
      members: userIds,
    });
    await this.channel.watch();
    console.log('Canal inicialitzat:', this.channel.id);

    // Mostrem els membres del canal al log.
    console.log('Membres del canal:', this.channel.state.members);

    // Configurem un esdeveniment per escoltar missatges nous en temps real.
    this.channel.on('message.new', (event: any) => {
      console.log('Missatge rebut en temps real:', event.message);

      // Afegim el missatge rebut a la llista de missatges.
      this.messages.push(event.message);

      // Agrupem els missatges per data.
      this.groupMessagesByDate(this.messages);

      // Actualitzem la interfície gràfica.
      this.cdr.detectChanges();

      // Fem scroll fins al final del xat.
      this.scrollToBottom();
    });

    // Carreguem els missatges existents del canal (fins a un màxim de 20).
    const response = await this.channel.query({ messages: { limit: 20 } });
    console.log('Missatges carregats del canal:', response.messages);

    // Assignem els missatges carregats a la llista de missatges.
    this.messages = response?.messages ?? [];

    // Agrupem els missatges per data.
    this.groupMessagesByDate(this.messages);

    // Fem scroll fins al final del xat.
    this.scrollToBottom();
  } catch (error) {
    // Gestionem els errors que es produeixin durant l'inici del xat.
    console.error('Error en iniciar el xat:', error);
  }
}

/**
 * Fa scroll fins al final de l'historial de missatges.
 */
private scrollToBottom(): void {
  try {
    // Establim el scroll de l'element de l'historial de xat al final.
    this.chatHistory.nativeElement.scrollTop = this.chatHistory.nativeElement.scrollHeight;
  } catch (err) {
    // Gestionem els errors que es produeixin durant l'operació de scroll.
    console.error('Error al fer scroll cap avall:', err);
  }
}

/**
 * Envia un missatge al canal actual.
 */
async sendMessage(): Promise<void> {
  // Comprovem si el missatge és buit.
  if (this.newMessage.trim() === '') return;

  try {
    // Creem un log per indicar que s'està enviant un missatge. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
    console.log('Enviant missatge:', this.newMessage);

    // Enviem el missatge al canal actual.
    const response = await this.channel.sendMessage({ text: this.newMessage });
    console.log('Missatge enviat:', response);

    // Mostrem l'estat actual del canal després d'enviar el missatge.
    console.log('Estat actual del canal després d\'enviar el missatge:', this.channel.state.messages);

    // Buidem el camp del nou missatge després d'enviar-lo.
    this.newMessage = '';
  } catch (error) {
    // Gestionem els errors que es produeixin durant l'enviament del missatge.
    console.error('Error en enviar el missatge:', error);
  }
}

 /**
 * Obté un avatar per a un usuari. Si l'usuari té una imatge definida, la retorna.
 * Si no, retorna un avatar aleatori de la llista predefinida.
 * @param user L'usuari per al qual es vol obtenir l'avatar.
 * @returns La URL de l'avatar de l'usuari.
 */
getRandomAvatar(user: any): string {
  // Comprovem si l'usuari no està definit.
  if (!user) {
    // Retornem el primer avatar de la llista predefinida.
    return this.randomAvatars[0];
  }

  // Comprovem si l'usuari té una imatge definida.
  if (user.imatge) {
    // Si la imatge no comença amb "http", assumim que és una ruta relativa i la convertim en una URL completa.
    if (!user.imatge.startsWith('http')) {
      return `http://domestius2.vercel.app/${user.imatge}`;
    }
    // Retornem la imatge de l'usuari si ja és una URL completa.
    return user.imatge;
  }

  // Si l'usuari no té una imatge, generem un índex basat en el seu ID per seleccionar un avatar aleatori.
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  const index = userId % this.randomAvatars.length;

  // Retornem l'avatar seleccionat de la llista predefinida.
  return this.randomAvatars[index];
}

 /**
 * Obté l'última connexió de l'usuari seleccionat al canal actual.
 * @returns Una cadena amb la data i hora de l'última connexió, o un missatge indicant que no hi ha activitat recent.
 */
getUltimaConexio(): string {
  // Comprovem si no hi ha cap usuari seleccionat o si no hi ha cap canal actiu.
  if (!this.selectedUser || !this.channel) {
    // Retornem "Desconeguda" si no es pot determinar l'última connexió.
    return 'Desconeguda';
  }

  // Obtenim els membres del canal i filtrem aquells que tenen un ID d'usuari definit.
  const members = Object.values(this.channel.state.members)
    .map((member) => member as ChannelMember)
    .filter((member) => member.user_id);

  // Busquem el membre que no és l'usuari actual (l'altre membre del canal).
  const otherMember = members.find(
    (member) => member.user_id !== this.chatClient.userID
  );

  // Comprovem si l'altre membre té una data d'última activitat definida.
  if (otherMember && otherMember.user?.last_active) {
    // Convertim la data d'última activitat a un format llegible i la retornem.
    return new Date(otherMember.user.last_active).toLocaleString();
  }

  // Si no hi ha activitat recent, retornem un missatge indicant-ho.
  return 'No hi ha activitat recent';
}

  /**
 * Tanca la sessió de l'usuari actual, elimina les dades locals i redirigeix a la pàgina de login.
 */
logout(): void {
  // Cridem al servei d'autenticació per tancar la sessió de l'usuari.
  this.authService.logout().subscribe({
    // Si la sessió es tanca correctament:
    next: () => {
      // Creem un log per indicar que la sessió s'ha tancat correctament al servidor. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
      console.log('Sessió tancada al servidor');

      // Eliminem l'últim usuari seleccionat del localStorage.
      localStorage.removeItem('lastUser');

      // Revoquem el token d'autenticació de l'usuari.
      this.tokenService.revokeToken();

      // Redirigim l'usuari a la pàgina de login.
      this.router.navigate(['/login']);
    },
    // Si hi ha un error en tancar la sessió:
    error: (err) => {
      // Creem un log per indicar que hi ha hagut un error en tancar la sessió. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
      console.error('Error en tancar sessió:', err);

      // Eliminem l'últim usuari seleccionat del localStorage.
      localStorage.removeItem('lastUser');

      // Revoquem el token d'autenticació de l'usuari.
      this.tokenService.revokeToken();

      // Redirigim l'usuari a la pàgina de login.
      this.router.navigate(['/login']);
    }
  });
}
 /**
 * Agrupem els missatges per data i els assignem a la propietat `groupedMessages`.
 * @param messages La llista de missatges que es vol agrupar.
 */
private groupMessagesByDate(messages: any[]): void {
  // Utilitzem `reduce` per agrupar els missatges per data.
  const grouped = messages.reduce((acc, message) => {
    // Convertim la data de creació del missatge a un format de data local.
    const messageDate = new Date(message.created_at).toLocaleDateString();

    // Comprovem si la data no existeix encara en l'agrupació.
    if (!acc[messageDate]) {
      // Si no existeix, inicialitzem un array buit per aquesta data.
      acc[messageDate] = [];
    }

    // Afegim el missatge a l'array corresponent a la seva data.
    acc[messageDate].push(message);
    return acc;
  }, {} as { [key: string]: any[] });

  // Convertim l'objecte agrupat en un array de dates i missatges.
  this.groupedMessages = Object.keys(grouped).map((date) => ({
    // Formatem la data utilitzant el mètode `formatDate`.
    date: this.formatDate(date),
    // Assignem els missatges agrupats per aquesta data.
    messages: grouped[date],
  }));
}
 /**
 * Formatem una data en un format llegible per a l'usuari.
 * @param date La data que es vol formatar.
 * @returns Una cadena amb la data formatada.
 */
private formatDate(date: string): string {
  // Obtenim la data d'avui en format local.
  const today = new Date().toLocaleDateString('ca-ES');

  // Obtenim la data d'ahir en format local.
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('ca-ES');

  // Comprovem si la data és avui.
  if (date === today) {
    return 'Avui';
  }
  // Comprovem si la data és ahir.
  else if (date === yesterday) {
    return 'Ahir';
  }
  // Si la data no és avui ni ahir, la formatem en un format més detallat.
  else {
    // Separem la data en dia, mes i any.
    const [day, month, year] = date.split('/').map(Number);

    // Creem un objecte de data a partir dels valors obtinguts.
    const parsedDate = new Date(year, month - 1, day);

    // Comprovem si la data és vàlida.
    if (!isNaN(parsedDate.getTime())) {
      // Retornem la data formatada amb el nom del dia, mes i any en catala.
      return new Intl.DateTimeFormat('ca-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(parsedDate);
    } else {
      // Si la data no és vàlida, mostrem un error al log i retornem un missatge d'error.
      console.error('Invalid date:', date);
      return 'Data desconeguda';
    }
  }
}
 /**
 * Elimina tots els missatges del xat i actualitza la interfície.
 */
clearChat(): void {
  // Mostrem una confirmació a l'usuari abans d'eliminar els missatges.
  if (confirm('Estàs segur que vols eliminar tots els missatges del xat?')) {
    // Eliminem tots els missatges de la llista de missatges.
    this.messages = [];

    // Eliminem tots els missatges agrupats.
    this.groupedMessages = [];

    // Creem un log per indicar que els missatges han estat eliminats. PER MILLORAR LA GESTIO DE POSSIBLES ERRORS
    console.log('Missatges eliminats.');

    // Actualitzem la interfície gràfica per reflectir els canvis.
    this.cdr.detectChanges();
  }
}
}