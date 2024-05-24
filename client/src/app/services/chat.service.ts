import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import * as io from 'socket.io-client';

interface Message {
  recipient: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket;

  constructor() {
    this.socket = io.io('http://localhost:3000');
  }

  joinChat(username: string, recipient: string) {
    this.socket.emit('join', { username, recipient });
  }

  sendMessage(message: string, sender: string, recipient: string) {
    this.socket.emit('message', { message, sender, recipient });
  }

  editMessage(messageId: string, newContent: string, sender: string) {
    console.log("Sending edit message request with ID:", messageId, "new content:", newContent, "sender:", sender); // Debugging log
    this.socket.emit('editMessage', { messageId, newContent, sender });
  }

  getMessages(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
  }
    // Add this method to listen for messageEdited events
    getMessageEdited(): Observable<any> {
      return new Observable(observer => {
        this.socket.on('messageEdited', (data) => {
          observer.next(data);
        });
      });
    }

  getNotifications(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('notification', (data) => {
        observer.next(data);
      });
    });
  }
}
