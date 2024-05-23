import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-msngr',
  templateUrl: './msngr.component.html',
  styleUrls: ['./msngr.component.scss']
})
export class MsngrComponent {
  messages: any[] = [];
  username!: string;
  recipient!: string;
  message!: string;
  roomId!: string;
  notifications: string[] = [];
  unreadCount = 0;
  chatRooms : any[]=[];
 
  constructor(private chatService: ChatService, private http: HttpClient) {}
 
  ngOnInit() {
     this.chatService.getMessages().subscribe((message) => {
       this.messages.push(message);
     });
     this.chatService.getNotifications().subscribe((notification) => {
      this.notifications.push(notification);
      this.unreadCount++;
    });
    //  this.roomId = "663b6f6b39193f23be96f56c";
     this.fetchOldMessages(this.username)
  }
 
  joinChat() {
     this.chatService.joinChat(this.username, this.recipient);
     this.getUserChatRooms();
  }
  fetchOldMessages(chatRoomId:string) {
    
    this.http.get<any[]>(`http://localhost:3000/api/chatrooms/${chatRoomId}/messages`).subscribe(messages => {
      this.messages = messages;
    });
  }
  getUserChatRooms() {
    return this.http.get<any[]>(`http://localhost:3000/api/chatrooms/${this.username}`).subscribe(chatRooms => {
      this.chatRooms = chatRooms;
    });
  }
  
  sendMessage() {
     this.chatService.sendMessage(this.message, this.username, this.recipient);
     this.message = '';
  }
  clearNotifications() {
    this.unreadCount = 0;
  }
}
