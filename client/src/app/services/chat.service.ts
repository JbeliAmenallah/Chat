import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private messageSubject = new Subject<any>();
  private messageEditedSubject = new Subject<any>();
  private notificationSubject = new Subject<any>();
  private typingSubject = new Subject<any>();

  username: string = '';
  typingUsers: string[] = [];

  constructor() {
    this.socket = io('http://localhost:3000'); // Ensure this matches your server URL

    // Initialize socket listeners
    this.socket.on('message', (data) => this.messageSubject.next(data));
    this.socket.on('messageEdited', (data) => this.messageEditedSubject.next(data));
    this.socket.on('notification', (data) => this.notificationSubject.next(data));
    this.socket.on('typing', (data) => {
      console.log("Received typing event:", data); // Add log to confirm event reception
      this.typingSubject.next(data);
    });
  }

  joinChat(username: string, recipient: string) {
    this.username = username;
    this.socket.emit('join', { username, recipient });
  }

  sendMessage(message: string, sender: string, recipient: string) {
    this.socket.emit('message', { message, sender, recipient });
  }

  editMessage(messageId: string, newContent: string, sender: string) {
    console.log("Sending edit message request with ID:", messageId, "new content:", newContent, "sender:", sender);
    this.socket.emit('editMessage', { messageId, newContent, sender });
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getMessageEdited(): Observable<any> {
    return this.messageEditedSubject.asObservable();
  }

  getNotifications(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  typing(sender: string, recipient: string, isTyping: boolean) {
    this.socket.emit('typing', { sender, recipient, isTyping });
    console.log(`${sender} is typing to ${recipient}: ${isTyping}`);
  }

  receiveTyping(): Observable<any> {
    return this.typingSubject.asObservable();
  }
}
