import { Component } from '@angular/core';
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
  chatRooms: any[] = [];
  messageIdToEdit!: string | null;
  newContent!: string;

  constructor(private chatService: ChatService, private http: HttpClient) {}

  ngOnInit() {
    this.chatService.getMessages().subscribe((message) => {
      this.messages.push(message);
    });
    this.chatService.getNotifications().subscribe((notification) => {
      this.notifications.push(notification);
      this.unreadCount++;
    });
    this.fetchOldMessages(this.roomId);
  
    // Listen for messageEdited event
    this.chatService.getMessageEdited().subscribe((editedMessage) => {
      this.updateEditedMessage(editedMessage);
    });
  }
  
  updateEditedMessage(editedMessage: any) {
    // Find the index of the edited message in the messages array
    const index = this.messages.findIndex(msg => msg._id === editedMessage.messageId);
    if (index !== -1) {
      // Update the message content
      this.messages[index].message = editedMessage.newContent;
    }
  }

  joinChat() {
    this.chatService.joinChat(this.username, this.recipient);
    this.getUserChatRooms();
  }

  fetchOldMessages(chatRoomId: string) {
    this.http.get<any[]>(`http://localhost:3000/api/chatrooms/${chatRoomId}/messages`).subscribe(messages => {
      this.messages = messages;
    });
  }

  getUserChatRooms() {
    this.http.get<any[]>(`http://localhost:3000/api/chatrooms/${this.username}`).subscribe(chatRooms => {
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

  initiateEditMessage(messageId: string, messageContent: string) {
    this.messageIdToEdit = messageId;
    this.newContent = messageContent;
  }

  editMessage() {
    if (this.messageIdToEdit) {
      this.chatService.editMessage(this.messageIdToEdit, this.newContent, this.username);
      // No need to manually update the UI here. Wait for the messageEdited event from the server.
      this.messageIdToEdit = null;
      this.newContent = '';
    }
  }
}
